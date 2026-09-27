/**
 * Modo de prueba: responde como n8n usando la misma lógica que el workflow (logic.js),
 * con una pequeña espera para simular la red.
 */
import { analyzeSuppliers, appointmentReply, chatReply, financeReport, planRoutes, quoteReply } from './logic';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockChat = async (payload) => {
  await delay(900 + Math.random() * 700);
  return chatReply(payload);
};

export const mockQuote = async (payload) => {
  await delay(1400);
  return quoteReply(payload);
};

export const mockAppointment = async (payload) => {
  await delay(1000);
  return appointmentReply(payload);
};

export const mockRoutes = async (payload) => {
  await delay(800);
  return planRoutes(payload);
};

export const mockSuppliers = async (payload) => {
  await delay(700);
  return analyzeSuppliers(payload);
};

export const mockFinance = async (payload) => {
  await delay(900);
  return financeReport(payload);
};
