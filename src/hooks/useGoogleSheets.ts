
import { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-g7b0fm679lb4p45p5lou070cqscaalaf.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//0gT2uoYBlNdGXCgYIARAAGBASNwF-L9IrBK_ijYwpce6-TdqDfji4GxYuc4uxIBKasdgoZBPm-tu_EU0xS34cNirqfLgXbJ8_NMk",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SHEET_ID = "1ms082PTG8lt566ndWBf687baIl-knERPL1r2v7-dPxg";

export interface SalesData {
  memberID: string;
  customerName: string;
  customerEmail: string;
  payingMemberID: string;
  saleItemID: string;
  paymentCategory: string;
  membershipType: string;
  paymentDate: string;
  paymentValue: number;
  paidInMoneyCredits: string;
  paymentVAT: number;
  paymentItem: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentTransactionID: string;
  stripeToken: string;
  soldBy: string;
  saleReference: string;
  calculatedLocation: string;
  cleanedProduct: string;
  cleanedCategory: string;
}

export const useGoogleSheets = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    try {
      const response = await axios.post(GOOGLE_CONFIG.TOKEN_URL, {
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
        refresh_token: GOOGLE_CONFIG.REFRESH_TOKEN,
        grant_type: 'refresh_token'
      });
      return response.data.access_token;
    } catch (err) {
      console.error('Error getting access token:', err);
      throw new Error('Failed to authenticate with Google Sheets');
    }
  };

  const fetchSheetData = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/◉ Sales?alt=json`;
      
      const response = await axios.get(sheetUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        throw new Error('No data found in sheet');
      }

      // Convert to objects
      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      const parsedData: SalesData[] = dataRows.map((row: string[]) => ({
        memberID: row[0] || '',
        customerName: row[1] || '',
        customerEmail: row[2] || '',
        payingMemberID: row[3] || '',
        saleItemID: row[4] || '',
        paymentCategory: row[5] || '',
        membershipType: row[6] || '',
        paymentDate: row[7] || '',
        paymentValue: parseFloat(row[8]) || 0,
        paidInMoneyCredits: row[9] || '',
        paymentVAT: parseFloat(row[10]) || 0,
        paymentItem: row[11] || '',
        paymentStatus: row[12] || '',
        paymentMethod: row[13] || '',
        paymentTransactionID: row[14] || '',
        stripeToken: row[15] || '',
        soldBy: row[16] || '',
        saleReference: row[17] || '',
        calculatedLocation: row[18] || '',
        cleanedProduct: row[19] || '',
        cleanedCategory: row[20] || ''
      }));

      setData(parsedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching sheet data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

  return { data, loading, error, refetch: fetchSheetData };
};
