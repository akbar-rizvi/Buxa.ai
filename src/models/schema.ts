import { pgTable, serial, varchar, text, integer, jsonb, timestamp, boolean,primaryKey } from 'drizzle-orm/pg-core';
import { sql , relations } from 'drizzle-orm';


export const users:any = pgTable('userss', {
    id: serial('id').primaryKey(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phoneNumber: varchar('phone_number',{length:10}).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    credits:integer("credits").default(50),
    // usedCredits:integer("used_credits").default(0),
    // totalContent:integer("total_content").default(0),
    // totalResearch:integer("total_research").default(0),
    // totalAlerts:integer("total_alerts").default(0),
    // coc:integer("credits_on_content").default(0),
    // cor:integer("credits_on_research").default(0),
    // coa:integer("credits_on_alerts").default(0),
    refreshToken: text('refresh_token'),
    createdAt: timestamp('created_at').default(sql`NOW()`),
    updatedAt: timestamp('updated_at').default(sql`NOW()`),
}, (table) => ({
  pk: primaryKey({ columns: [table.id] }),
}));

export const documents:any = pgTable('documents', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    metadata: jsonb('metadata'), 
    keyword:jsonb('keyword'),
    // documentType:varchar("document_type"),
    isDeleted: boolean('is_deleted').default(false),
    isFavorite: boolean('is_favorite').default(false),
    createdAt: timestamp('created_at').default(sql`NOW()`),
    updatedAt: timestamp('updated_at').default(sql`NOW()`),

}, (table) => ({
  pk: primaryKey({ columns: [table.id] }),
}));

// export const alert=pgTable("alert",{
//   id:serial("id"),
//   userId: integer('user_id').references(() => users.id),
//   alertId:varchar("alert_id"),
//   metaData:jsonb('metadata'),
//   alertContent:varchar('alert_content'),
//   isDeleted: boolean('is_deleted').default(false),
//   isFavorite: boolean('is_favorite').default(false),
//   createdAt: timestamp('created_at').default(sql`NOW()`),
// }, (table) => ({
//   pk: primaryKey({ columns: [table.id] }),
// }))

export const payment:any=pgTable("payment",{
  id:serial("id"),
  orderId:varchar("order_id"),
  status:varchar("status").default("pending"),
  userId:integer("user_id").references(()=>users.id),
  refId:integer("ref_id"),
  method:varchar("method"),
  credits:integer("credits"),
  amount:integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
},(table)=>({
  pk:primaryKey({columns:[table.id]})
}))

export const paymentRelation = relations(payment, ({ one }) => ({
  user: one(users, {
    fields: [payment.userId],
    references: [users.id],
    relationName: 'payments'
  })
}))

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents, { relationName: 'documents' }),
  payments: many(payment, { relationName: 'payments' }),
  // alerts: many(alert, { relationName: 'alerts' })
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
    relationName: 'documents'
  })
}));

// export const alertRelations = relations(alert, ({ one }) => ({
//   user: one(users, {
//     fields: [alert.userId],
//     references: [users.id],
//     relationName: 'alerts'
//   })
// }))

