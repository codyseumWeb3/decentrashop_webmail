import { IExecWeb3mail } from '@iexec/web3mail';
import { checkCurrentChain } from './utils';

export async function fetchMyContacts(wallet: any) {
  try {
    await checkCurrentChain();
  } catch (err) {
    return {
      contacts: null,
      error: 'Wrong network, please switch to iExec sidechain',
    };
  }

  const web3mail = new IExecWeb3mail(wallet);
  const contacts = await web3mail.fetchMyContacts();
  return { contacts, error: '' };
}

export async function sendMail(
  mailObject: string,
  mailContent: string,
  wallet: any,
  protectedData: string,
  contentType?: string,
  senderName?: string
) {
  await checkCurrentChain();
  const web3mail = new IExecWeb3mail(wallet);
  const { taskId } = await web3mail.sendEmail({
    emailSubject: mailObject,
    emailContent: mailContent,
    protectedData,
    contentType,
    senderName,
  });
  console.log('iExec worker taskId', taskId);
  return taskId;
}
