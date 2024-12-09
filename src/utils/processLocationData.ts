import * as XLSX from 'xlsx';

interface LocationData {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
}

export const processExcelData = async (filePath: string): Promise<LocationData[]> => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  return data.map((row: any, index: number) => ({
    id: index + 1,
    name: row.name || 'Unnamed Location',
    address: row.address || '',
    lat: Number(row.latitude) || 0,
    lng: Number(row.longitude) || 0,
    description: row.description || ''
  }));
};