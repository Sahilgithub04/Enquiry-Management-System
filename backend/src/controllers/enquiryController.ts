import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Enquiry, EnquiryStatus } from '../models/Enquiry';
import { UserRole } from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../middlewares/errorMiddleware';

const createEnquirySchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  message: z.string().min(1, 'Message is required'),
  status: z.nativeEnum(EnquiryStatus).optional().default(EnquiryStatus.NEW),
  assignedTo: z.string().nullable().optional(),
});

const updateEnquirySchema = z.object({
  customerName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  status: z.nativeEnum(EnquiryStatus).optional(),
  assignedTo: z.string().nullable().optional(),
});

export const createEnquiry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = createEnquirySchema.parse(req.body);

    const enquiry = await Enquiry.create({
      customerName: validated.customerName,
      email: validated.email.toLowerCase(),
      phone: validated.phone,
      message: validated.message,
      status: validated.status,
      assignedTo: validated.assignedTo || null,
    });

    const populatedEnquiry = await Enquiry.findById(enquiry._id).populate('assignedTo', 'name email role');

    res.status(201).json({
      success: true,
      data: populatedEnquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnquiries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || '';
    const status = req.query.status as string;
    const assignee = req.query.assignee as string;

    const skip = (page - 1) * limit;

    // Filter out soft deleted enquiries
    const query: any = { deletedAt: null };

    if (status && Object.values(EnquiryStatus).includes(status as EnquiryStatus)) {
      query.status = status;
    }

    if (assignee) {
      if (assignee === 'unassigned') {
        query.assignedTo = null;
      } else {
        query.assignedTo = assignee;
      }
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { customerName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const total = await Enquiry.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const enquiries = await Enquiry.find(query)
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: enquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findOne({ _id: id, deletedAt: null }).populate('assignedTo', 'name email role');

    if (!enquiry) {
      throw new AppError('Enquiry not found', 404);
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    const enquiry = await Enquiry.findOne({ _id: id, deletedAt: null });
    if (!enquiry) {
      throw new AppError('Enquiry not found', 404);
    }

    // Role Permission check for AGENT
    if (userRole === UserRole.AGENT) {
      if (!enquiry.assignedTo || enquiry.assignedTo.toString() !== userId) {
        throw new AppError('Agents can only edit enquiries assigned to them', 403);
      }
    }

    const validated = updateEnquirySchema.parse(req.body);

    if (validated.customerName) enquiry.customerName = validated.customerName;
    if (validated.email) enquiry.email = validated.email.toLowerCase();
    if (validated.phone) enquiry.phone = validated.phone;
    if (validated.message) enquiry.message = validated.message;
    if (validated.status) enquiry.status = validated.status;

    if (validated.assignedTo !== undefined) {
      // Agents cannot change assignment
      if (userRole === UserRole.AGENT && validated.assignedTo !== enquiry.assignedTo?.toString()) {
        throw new AppError('Agents cannot change enquiry assignment', 403);
      }
      enquiry.assignedTo = validated.assignedTo ? (validated.assignedTo as any) : null;
    }

    await enquiry.save();

    const updatedEnquiry = await Enquiry.findById(enquiry._id).populate('assignedTo', 'name email role');

    res.status(200).json({
      success: true,
      data: updatedEnquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEnquiry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findOne({ _id: id, deletedAt: null });

    if (!enquiry) {
      throw new AppError('Enquiry not found', 404);
    }

    // Soft delete
    enquiry.deletedAt = new Date();
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
