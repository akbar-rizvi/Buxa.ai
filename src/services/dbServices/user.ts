import { users, documents } from "../../models/schema";
import postgresdb from "../../config/db";

import { generateAuthTokens } from "../../config/jwt";
import { and, desc, eq } from "drizzle-orm";

export default class user {
  static googleLogIn = async (email: string, name: string): Promise<any> => {
    try {
      const user: any = await postgresdb
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (user.length <= 0) {
        const nameParts = name.split(" ");
        const user: any = await postgresdb
          .insert(users)
          .values({
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(" "),
            email: email,
            phoneNumber: "null",
            password: "null",
          })
          .returning();
        const token = generateAuthTokens({ userId: user[0].id });
        return { token: token, user: user[0] };
      }
      const token = generateAuthTokens({ userId: user[0].id });
      return { token, user: user[0] };
    } catch (error: any) {
      throw new Error(error);
    }
  };

  static userDetails = async (data: number): Promise<any> => {
    try {
      const details = await postgresdb
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          credits: users.credits,
        })
        .from(users)
        .where(eq(users.id, data))
        .limit(1);
      return details;
    } catch (error) {
      throw new Error(error);
    }
  };

  static dashboardData = async (userId: number): Promise<any> => {
    try {
      const userDetails = await postgresdb
        .select({
          credits: users.credits,
          usedCredits: users.usedCredits,
          totalContent: users.totalContent,
          totalResearch: users.totalResearch,
          totalAlerts: users.totalAlerts,
          coc: users.coc,
          cor: users.cor,
          coa: users.coa,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return {
        documents: await postgresdb
          .select({
            id: documents.id,
            content: documents.content,
            updatedAt: documents.updatedAt,
            isDeleted: documents.isDeleted,
            documentType: documents.documentType,
          })
          .from(documents)
          .where(
            and(eq(documents.userId, userId), eq(documents.isDeleted, false))
          )
          .orderBy(desc(documents.updatedAt))
          .limit(20)
          .execute(),
        userDetails: userDetails[0],
      };
    } catch (error) {
      throw new Error(error);
    }
  };
}
