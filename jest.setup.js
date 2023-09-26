import 'isomorphic-fetch'
import "@testing-library/jest-dom/extend-expect";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
