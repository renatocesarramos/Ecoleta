import {Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {
  
  async show(req:Request, res:Response) {

    const { id } = req.params

    const point = await knex('points').where('id', id).first();
    const itens = await knex('itens')
      .join('point_itens', 'itens.id', '=','point_itens.item_id')
      .where('point_itens.point_id', id)
      .select('itens.title')

    if(!point){
      return res.status(400).json({message: 'Point Not Found'})
    }

    return res.json({point, itens})

  }

  async create(req:Request, res:Response) {
    const {
      name,
      email,
      whatsapp,
      longitude,
      latitude,
      city,
      uf,
      itens
    } = req.body;

    const trx = await knex.transaction()
    const point = {
      image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
      name,
      email,
      whatsapp,
      longitude,
      latitude,
      city,
      uf
    }

    const insertedIds = await trx('points').insert(point)

    const point_id = insertedIds[0]

    const pointItens = itens.map((item_id: Number) => {
      return {
        item_id,
        point_id
      }
    })

    await trx('point_itens').insert(pointItens);

    await trx.commit()

    return res.json({
      id: point_id,
      ...point
    })
  }

  async index(req:Request, res:Response){
    const { city, uf, itens} = req.query

    const parsedItens = String(itens)
      .split(',')
      .map(item => Number(item.trim()))
    
    const points = await knex('points')
      .join('point_itens', 'points.id', '=', 'point_itens.point_id')
      .whereIn('point_itens.item_id', parsedItens)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    return res.json(points)
  }

}

export default PointsController;