import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Campaign } from './entities/campaign.entity';
import { CampaignProduct } from './entities/campaign-product.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { QueryCampaignDto } from './dto/query-campaign.dto';
import { AddCampaignProductDto } from './dto/add-campaign-product.dto';
import { NOTIFICATION_EVENTS } from '../notification/notification.events';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(CampaignProduct)
    private readonly campaignProductRepo: Repository<CampaignProduct>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepo.create({
      ...dto,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      status: 'draft',
    });
    return this.campaignRepo.save(campaign);
  }

  async findAll(query: QueryCampaignDto) {
    const { page = 1, pageSize = 10, name, type, status } = query;

    const qb = this.campaignRepo.createQueryBuilder('c');
    qb.loadRelationCountAndMap('c.productCount', 'c.products');

    if (name) {
      qb.andWhere('c.name LIKE :name', { name: `%${name}%` });
    }
    if (type) {
      qb.andWhere('c.type = :type', { type });
    }
    if (status) {
      qb.andWhere('c.status = :status', { status });
    }

    qb.orderBy('c.created_at', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page: +page,
      pageSize: +pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!campaign) {
      throw new NotFoundException('活动不存在');
    }
    return campaign;
  }

  async update(id: number, dto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.findOne(id);
    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      throw new BadRequestException('只能编辑草稿或已暂停的活动');
    }
    Object.assign(campaign, dto);
    if (dto.startTime) campaign.startTime = new Date(dto.startTime);
    if (dto.endTime) campaign.endTime = new Date(dto.endTime);
    return this.campaignRepo.save(campaign);
  }

  async remove(id: number): Promise<void> {
    const campaign = await this.findOne(id);
    if (campaign.status === 'active') {
      throw new BadRequestException(
        `活动「${campaign.name}」正在进行中，无法删除。请先暂停或结束活动后再删除。`,
      );
    }
    if (campaign.status === 'paused') {
      throw new BadRequestException(
        `活动「${campaign.name}」当前为暂停状态，无法直接删除。请先将活动结束后再删除。`,
      );
    }
    if (campaign.status === 'ended') {
      throw new BadRequestException(
        `活动「${campaign.name}」已结束，包含历史数据不可删除。如需清理请联系管理员。`,
      );
    }
    await this.campaignProductRepo.delete({ campaignId: id });
    await this.campaignRepo.delete(id);
  }

  async addProducts(id: number, dto: AddCampaignProductDto): Promise<void> {
    const campaign = await this.findOne(id);
    if (campaign.status === 'ended') {
      throw new BadRequestException('已结束的活动不能添加商品');
    }
    const entities = dto.products.map((p) =>
      this.campaignProductRepo.create({
        campaignId: id,
        productId: p.productId,
        campaignPrice: p.campaignPrice,
        stock: p.stock,
        soldCount: 0,
      }),
    );
    await this.campaignProductRepo.save(entities);
  }

  async removeProduct(campaignId: number, productId: number): Promise<void> {
    const campaign = await this.findOne(campaignId);
    if (campaign.status === 'active') {
      throw new BadRequestException('进行中的活动不能移除商品');
    }
    await this.campaignProductRepo.delete({ campaignId, productId });
  }

  async activate(id: number): Promise<Campaign> {
    const campaign = await this.findOne(id);
    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      throw new BadRequestException('只有草稿或暂停的活动可以激活');
    }
    if (!campaign.products || campaign.products.length === 0) {
      throw new BadRequestException('活动至少需要一个商品');
    }
    if (new Date(campaign.endTime) <= new Date()) {
      throw new BadRequestException('活动结束时间不能早于当前时间');
    }
    campaign.status = 'active';
    const saved = await this.campaignRepo.save(campaign);
    this.eventEmitter.emit(NOTIFICATION_EVENTS.CAMPAIGN_STATUS_CHANGED, {
      campaignId: id,
      campaignName: campaign.name,
      status: '进行中',
    });
    return saved;
  }

  async pause(id: number): Promise<Campaign> {
    const campaign = await this.findOne(id);
    if (campaign.status !== 'active') {
      throw new BadRequestException('只有进行中的活动可以暂停');
    }
    campaign.status = 'paused';
    const saved = await this.campaignRepo.save(campaign);
    this.eventEmitter.emit(NOTIFICATION_EVENTS.CAMPAIGN_STATUS_CHANGED, {
      campaignId: id,
      campaignName: campaign.name,
      status: '已暂停',
    });
    return saved;
  }

  async end(id: number): Promise<Campaign> {
    const campaign = await this.findOne(id);
    if (campaign.status !== 'active' && campaign.status !== 'paused') {
      throw new BadRequestException('只有进行中或暂停的活动可以结束');
    }
    campaign.status = 'ended';
    const saved = await this.campaignRepo.save(campaign);
    this.eventEmitter.emit(NOTIFICATION_EVENTS.CAMPAIGN_STATUS_CHANGED, {
      campaignId: id,
      campaignName: campaign.name,
      status: '已结束',
    });
    return saved;
  }
}
