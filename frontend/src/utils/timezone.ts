// utils/timezone.ts
export const getUserTimezone = () => {
  // Get timezone from user profile, fallback to 'Asia/Kolkata' for IST
  return 'Asia/Kolkata'; // or from userProfile.timezone
};

export const formatToUserTimezone = (date: Date) => {
  return new Date(date.toLocaleString('en-US', { timeZone: getUserTimezone() }));
};

export const formatDateForAPI = (date: Date): string => {
  // Ensure we're using the date in user's timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};