import Express from 'express-serve-static-core'
import { DatabaseController } from '../db'
import { getUuid } from '../util'

export default function (db: DatabaseController, _options: any, upload: any) {
  return {
    async createTask (req: Express.Request, res: Express.Response) {
      const { body, params } = req.enforcer!
      const { taskListId } = params

      const list = await db.taskLists.getTaskListDetails(taskListId)
      if (!list) {
        res.sendStatus(404)
      } else if (list.accountId !== req.user!.id) {
        res.sendStatus(403)
      } else {
        await db.tasks.createTask(taskListId, body)
        res.sendStatus(201)
      }
    },

    async deleteTask (req: Express.Request, res: Express.Response) {
      const { params } = req.enforcer!
      const { taskId } = params
      const { access, exists } = await db.tasks.checkAccess(req.user!.id, taskId)
      if (!exists) {
        res.sendStatus(204)
      } else if (!access) {
        res.sendStatus(403)
      } else {
        await db.tasks.deleteTask(taskId)
        res.sendStatus(204)
      }
    },

    async deleteFile (req: Express.Request, res: Express.Response) {
      const { params } = req.enforcer!
      const { taskId, fileId } = params

      const { access, exists } = await db.tasks.checkAccess(req.user!.id, taskId)
      if (!exists) {
        res.sendStatus(404)
      } else if (!access) {
        res.sendStatus(403)
      } else {
        const task = await db.tasks.getTask(taskId)
        if (!task) {
          res.sendStatus(404)
        } else {
          const index = task.files!.findIndex(f => f.id === fileId)
          if (index !== -1) {
            await db.files.deleteFile(fileId)
            res.sendStatus(204)
          } else {
            res.sendStatus(404)
          }
        }
      }
    },

    async getTasks (req: Express.Request, res: Express.Response) {
      const { params } = req.enforcer!
      const { taskListId } = params

      const list = await db.taskLists.getTaskListDetails(taskListId)
      if (!list) {
        res.sendStatus(404)
      } else if (list.accountId !== req.user!.id) {
        res.sendStatus(403)
      } else {
        const tasks = await db.tasks.getTasks(taskListId)
        res.enforcer!.send(tasks)
      }
    },

    async getFile (req: Express.Request, res: Express.Response) {
      const { params } = req.enforcer!
      const { fileId } = params

      const file = await db.files.getFile(fileId)
      if (!file) {
        res.sendStatus(404)
      } else {
        res.download(file.filePath, file.name, (err: Error) => {
          if (err) {
            console.error(err)
            res.sendStatus(500)
          }
        })
      }
    },

    async updateTask (req: Express.Request, res: Express.Response) {
      const { body, params } = req.enforcer!
      const { taskId } = params

      const { access, exists } = await db.tasks.checkAccess(req.user!.id, taskId)
      if (!exists) {
        res.sendStatus(404)
      } else if (!access) {
        res.sendStatus(403)
      } else {
        const task = await db.tasks.setTask(taskId, body)
        res.enforcer!.send(task)
      }
    },

    async uploadFile (req: Express.Request, res: Express.Response) {
      upload(req, res, async (err?: Error) => {
        if (err) {
          console.error(err)
          res.sendStatus(500)
        } else {
          const { params } = req.enforcer!
          const { taskId } = params

          const { access, exists } = await db.tasks.checkAccess(req.user!.id, taskId)
          if (!exists) {
            res.sendStatus(404)
          } else if (!access) {
            res.sendStatus(403)
          } else {
            const length = req.files.length
            let file
            for (let i = 0; i < length; i++) {
              // @ts-ignore
              const { buffer, mimetype, originalname } = req.files[i]
              file = await db.files.saveFile(taskId, originalname, buffer, mimetype)
            }
            if (file) {
              res.set('Location', '/tasks/' + taskId + '/files/' + file.id)
              res.status(201)
            }
            res.enforcer!.send()
          }
        }
      })
    }
  }
}