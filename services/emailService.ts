import { Transaction, Template } from '../types';

// In a real Node.js environment, we would import nodemailer here.
// import nodemailer from 'nodemailer';

export const emailService = {
  /**
   * Sends an email notification to the admin when a payment is confirmed.
   */
  sendTransactionNotification: async (transaction: Transaction) => {
    console.group('%c 📧 [EMAIL SERVICE] Transaction Alert', 'color: #D4AF37; font-weight: bold;');
    console.log(`To: admin@afterhours.com`);
    console.log(`Subject: New Payment Received: IDR ${transaction.amount}`);
    console.log(`Body: Session ${transaction.sessionId} has been paid. Transaction ID: ${transaction.id}`);
    console.groupEnd();

    // Simulation of network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },

  /**
   * Sends an email notification to the admin when a new template is uploaded.
   */
  sendTemplateNotification: async (template: Template) => {
    console.group('%c 📧 [EMAIL SERVICE] Template Alert', 'color: #34D399; font-weight: bold;');
    console.log(`To: admin@afterhours.com`);
    console.log(`Subject: New Template Uploaded: ${template.name}`);
    console.log(`Body: A new template has been added to the library. ID: ${template.id}`);
    console.groupEnd();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
};