type InputUser = {
  telegram_id: number;
  username: string;
  hashed_token: string;
  full_name: string;
  barcode: number;
  is_admin: boolean;
  moodle_id: number;
};

type OutputUser = {
  name: string;
  telegramId: number;
  moodleId: number;
  moodleToken: string;
};
