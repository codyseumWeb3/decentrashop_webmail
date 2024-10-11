import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
} from '@mui/material';
import { Fragment, useState } from 'react';
import { getWeb3Provider, type Contact } from '@iexec/web3mail';
import { fetchMyContacts, sendMail } from './web3mail/web3mail';
import './styles.css';
import { ethers } from 'ethers';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(''); // State to track progress message
  const [errorMessage, setErrorMessage] = useState('');
  const [displayTable, setdisplayTable] = useState(false);
  const [emailSentSuccess, setemailSentSuccess] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [privateKey, setPrivateKey] = useState('');
  const [contactNumber, setContactNumber] = useState(0);
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);

  // New state variables for the form fields
  const [mailSubject, setMailSubject] = useState('');
  const [mailContent, setMailContent] = useState('');
  const [mailSender, setMailSender] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 10; // Number of contacts to display per page
  const pageLimit = 1;

  // Calculate the indexes of the contacts to display on the current page
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = contacts.slice(
    indexOfFirstContact,
    indexOfLastContact
  );

  const handlePrivateKeyChange = (e: any) => {
    setPrivateKey(e.target.value);
  };
  // Calculate the total number of pages
  const totalPages = Math.ceil(contacts.length / contactsPerPage);

  // Function to change the current page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Generate an array of page numbers to display in the pagination section
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    const totalPagesDisplayed = Math.min(pageLimit, totalPages);

    let startPage = 1;
    let endPage = totalPagesDisplayed;

    if (currentPage > Math.floor(pageLimit / 2)) {
      startPage = currentPage - Math.floor(pageLimit / 2);
      endPage = startPage + pageLimit - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = endPage - pageLimit + 1;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const handleLoadAddresses = async () => {
    try {
      setLoading(true);
      const { contacts: myContacts, error } = await fetchMyContacts(wallet);
      setLoading(false);
      if (error) {
        setErrorMessage(error);
        return;
      }
      setContacts(myContacts as Contact[]);
      setContactNumber(myContacts?.length ?? 0);
      setdisplayTable(true);
    } catch (err) {
      console.log('[fetchMyContacts] ERROR', err);
      setLoading(false);
    }
  };

  const handleSendMessage = async (protectedData: string) => {
    try {
      setLoading(true);
      await sendMail(
        mailSubject, // Using state variables for subject, content, and sender
        mailContent,
        wallet,
        protectedData,
        'text/plain',
        mailSender
      );
      setLoading(false);
      setemailSentSuccess(true);
    } catch (err) {
      console.log('[sendEmail] ERROR', err);
      setLoading(false);
    }
  };

  // Function to send to all contacts with progress tracking
  const handleSendToAll = async () => {
    try {
      setLoading(true);
      for (let i = 0; i < contacts.length; i++) {
        setLoadingMessage(`Sending to ${i + 1} of ${contacts.length}...`);
        await sendMail(
          mailSubject,
          mailContent,
          wallet,
          contacts[i].address,
          'text/plain',
          mailSender
        );
      }
      setLoadingMessage(''); // Clear the message after all emails are sent
      setLoading(false);
      setemailSentSuccess(true);
    } catch (err) {
      console.log('[sendToAll] ERROR', err);
      setLoading(false);
      setLoadingMessage(''); // Clear the message in case of error
    }
  };

  const createWallet = () => {
    try {
      if (privateKey) {
        const walletInstance = getWeb3Provider(privateKey);
        setWallet(walletInstance);
        console.log('Wallet successfully created');
      } else {
        console.error('Please enter a valid private key');
      }
    } catch (error) {
      console.error('Invalid private key', error);
    }
  };

  return (
    <Box className="my-box">
      <>
        <input
          type="password" // Use password input to hide the private key
          onChange={handlePrivateKeyChange}
          value={privateKey}
          placeholder="Enter your private key"
          style={{ marginTop: '24px', marginBottom: '24px' }}
        />
        <br />
        <Button variant="contained" onClick={createWallet}>
          Create Wallet
        </Button>
        {wallet && (
          <>
            <div>
              <p>Wallet Address: {wallet.address}</p>
            </div>
            <Button
              sx={{ display: 'block', margin: '30px auto' }}
              onClick={handleLoadAddresses}
              variant="contained"
            >
              Load authorized addresses
            </Button>
          </>
        )}
      </>

      {/* Form to input email details */}
      {wallet && (
        <Box sx={{ marginTop: '20px' }}>
          <TextField
            label="Mail Subject"
            fullWidth
            value={mailSubject}
            onChange={(e) => setMailSubject(e.target.value)}
            sx={{ marginBottom: '20px' }}
          />
          <TextField
            label="Mail Content"
            fullWidth
            multiline
            rows={4}
            value={mailContent}
            onChange={(e) => setMailContent(e.target.value)}
            sx={{ marginBottom: '20px' }}
          />
          <TextField
            label="Mail Sender"
            fullWidth
            value={mailSender}
            onChange={(e) => setMailSender(e.target.value)}
            sx={{ marginBottom: '20px' }}
          />

          {/* Button to send to all */}
          <Button
            sx={{ marginTop: '20px' }}
            variant="contained"
            onClick={handleSendToAll}
            disabled={contacts.length === 0 || loading} // Disable if no contacts or already loading
          >
            Send to All Contacts
          </Button>
        </Box>
      )}

      {loadingMessage && (
        <Typography sx={{ marginTop: '20px', textAlign: 'center' }}>
          {loadingMessage}
        </Typography>
      )}

      {errorMessage && (
        <Alert severity="error" style={{ maxWidth: 300, margin: 'auto' }}>
          {errorMessage}
        </Alert>
      )}

      {loading && (
        <CircularProgress
          sx={{ display: 'block', margin: '20px auto' }}
        ></CircularProgress>
      )}

      {displayTable && (
        <div>
          <Typography>Contact Number : {contactNumber}</Typography>

          <Table
            sx={{
              maxWidth: 200,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            aria-label="simple table"
          >
            <TableHead sx={{ border: 0, borderBottom: 'none' }}>
              <TableRow sx={{ border: 0, borderBottom: 'none' }}>
                <TableCell
                  sx={{
                    border: 0,
                    borderBottom: 'none',
                    fontWeight: 600,
                    minWidth: 335,
                  }}
                >
                  ETH Address
                </TableCell>
                <TableCell
                  sx={{
                    border: 0,
                    borderBottom: 'none',
                    fontWeight: 600,
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentContacts.map((contact, index) => (
                <TableRow key={index} sx={{ border: 0, borderBottom: 'none' }}>
                  <TableCell component="th" scope="row">
                    {contact.address}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      className="ButtonSendM"
                      sx={{}}
                      onClick={() => handleSendMessage(contact.address)}
                      variant="contained"
                    >
                      Send Message
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Box
            sx={{
              maxWidth: 425,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {contacts.length > contactsPerPage && (
              <ul className="pagination">
                {/* Previous button */}
                <Button
                  sx={{ color: 'black' }}
                  className="page-link"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {'<'}
                </Button>

                {/* Page numbers */}
                {getPageNumbers().map((pageNumber, index) => (
                  <Fragment key={index}>
                    <Button
                      sx={{ color: 'black' }}
                      className="page-link"
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  </Fragment>
                ))}

                {/* Next button */}
                <Button
                  sx={{ color: 'black' }}
                  className="page-link"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {'>'}
                </Button>
              </ul>
            )}
          </Box>
        </div>
      )}

      {emailSentSuccess && (
        <Alert
          severity="success"
          style={{ maxWidth: 300, margin: '30px auto' }}
        >
          The email is being sent.
        </Alert>
      )}
    </Box>
  );
}
