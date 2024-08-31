// Set the future date (e.g., December 31, 2024)
const futureDate = new Date('2024-09-01T00:00:00');

// Get the current date
const currentDate = new Date();

// Calculate the difference in milliseconds
const millisecondsDifference = futureDate - currentDate;

// Display the result
console.log(`Milliseconds from now to the future date: ${millisecondsDifference}`);