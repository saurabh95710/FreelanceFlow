import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as clientService from '../services/client.service';
import { sendSuccess } from '../utils/response';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const clients = await clientService.getClients(req.userId!);
    sendSuccess(res, clients, 'Clients retrieved');
  } catch (err) { next(err); }
}

export async function get(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const client = await clientService.getClientById(req.params.id as string, req.userId!);
    sendSuccess(res, client, 'Client retrieved');
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const client = await clientService.createClient(req.userId!, req.body);
    sendSuccess(res, client, 'Client created', 201);
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const client = await clientService.updateClient(req.params.id as string, req.userId!, req.body);
    sendSuccess(res, client, 'Client updated');
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await clientService.deleteClient(req.params.id as string, req.userId!);
    sendSuccess(res, null, 'Client deleted');
  } catch (err) { next(err); }
}