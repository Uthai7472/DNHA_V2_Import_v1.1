const originalDate = '1/12/2024 15:20:00'; // Example input date in 'd/M/YYYY HH:mm:ss' format
const parts = originalDate.split(/\/| /); // Split the date string by '/' and ' ' to extract day, month, year, and time parts
const modifiedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')} ${parts[3]}`; // Rearrange the parts to form the 'YYYY-MM-DD HH:mm:ss' format
console.log(modifiedDate); // Output: '2024-04-30 15:20:00'