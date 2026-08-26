import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Event } from 'src/event/entities/event.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(dto: CreateReviewDto, userId: string, eventId: string): Promise<Review> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException(`Event #${eventId} not found`);

    const existing = await this.reviewRepository.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
    });
    if (existing) throw new ConflictException('You have already reviewed this event.');

    const review = this.reviewRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      event: { id: eventId },
      user: { id: userId },
    });
    return this.reviewRepository.save(review);
  }

  async findByEvent(eventId: string, page = 1, limit = 10) {
    const qb = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.event_id = :eventId', { eventId })
      .orderBy('review.createdAt', 'DESC');

    qb.skip((page - 1) * limit).take(limit);

    const [reviews, total] = await qb.getManyAndCount();

    const avgResult = await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.event_id = :eventId', { eventId })
      .select('AVG(review.rating)', 'avg')
      .getRawOne();

    return {
      reviews,
      averageRating: Number(avgResult?.avg || 0),
      totalReviews: total,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, dto: UpdateReviewDto, userId: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException(`Review #${id} not found`);
    if (review.user.id !== userId) throw new ForbiddenException('You can only edit your own review.');
    Object.assign(review, dto);
    return this.reviewRepository.save(review);
  }

  async remove(id: string, userId: string, userRole?: string): Promise<void> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException(`Review #${id} not found`);
    if (review.user.id !== userId && userRole !== 'Admin') {
      throw new ForbiddenException('Not authorized.');
    }
    await this.reviewRepository.remove(review);
  }

  async getAverageRating(eventId: string): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.event_id = :eventId', { eventId })
      .select('AVG(review.rating)', 'avg')
      .getRawOne();
    return Number(result?.avg || 0);
  }
}
