import { Pool, PoolClient } from "pg"
import { AccountFactory, AccountController } from './accounts'
import { FileFactory, FileController } from './files'
import { TaskListController, TaskListFactory } from './task-lists'
import { TaskController, TaskFactory } from './tasks'

export interface DatabaseController {
  accounts: AccountController
  files: FileController
  taskLists: TaskListController
  tasks: TaskController
  transaction<T> (client: PoolClient | null, callback: TransactionCallback<T>): Promise<T>
}

type TransactionCallback<T> = (conn: PoolClient) => Promise<T>

export default function (db: Pool) {

  async function transaction<T> (client: PoolClient, callback: (conn: PoolClient) => Promise<T>): Promise<T> {
    if (client) {
      return callback(client)

    } else {
      client = await db.connect()
      try {
        await client.query('BEGIN')
        const result = await callback(client)
        await client.query('COMMIT')
        return result
  
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
  
      } finally {
        // finally still runs, even after a return
        client.release()
      }
    }
  }

  // @ts-ignore
  const context: DatabaseController = {}
  context.accounts = AccountFactory(db, context)
  context.files = FileFactory(db, context)
  context.taskLists = TaskListFactory(db, context)
  context.tasks = TaskFactory(db, context)
  context.transaction = transaction

  return context
}