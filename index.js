const { Bot, InlineKeyboard } = require('grammy');

const token = '1704059742:AAHzC21UiV6EaAugsItL8fCKDTgF0MrbKx0';
// Создаение бота
const bot = new Bot(token);

// Информация о зарегистрированных командах
bot.api.setMyCommands([
  { command: 'start', description: 'Начало использования' },
  { command: 'help', description: 'Справка' },
  { command: 'bot', description: 'Информация о боте' },
]);

// Обработчик команды /start.
bot.command('start', (ctx) => ctx.reply('Добро пожаловать!'));

bot.command('bot', async (ctx) => {
  const me = await bot.api.getMe();
  ctx.reply(`Идентификатор бота: ${me.id}`);
});

const users = [];
const keyboard = new InlineKeyboard().text('Да', 'yes').text('Нет', 'no');

const getInfoUser = async (ctx) => {
  const userId = ctx.from.id;
  const el = users[userId];
  if (!el) {
    return ctx.reply(`Ничего не нашлось`);
  }
  let user = ``;
  for (const [key, value] of Object.entries(users[userId])) {
    user += `${key}: ${value}, `;
  }
  ctx.reply(`Информация о пользователе: ${user.slice(0, -2)}`);
  return (users[userId] = '');
};

const getIdUser = async (ctx) => {
  const yourId = ctx.from.id;
  if (ctx.message.forward_from) {
    const forward = ctx.message.forward_from;
    users[yourId] = forward;
    await ctx.reply(`Этот пользователь имеет идентификатор: ${forward.id}`);
  } else {
    users[yourId] = ctx.from;
    await ctx.reply(`Ваш идентификатор: ${yourId}`);
  }
  return ctx.reply(`Вы бы хотели узнать больше?`, { reply_markup: keyboard });
};

// Обработчик остальных сообщений.
bot.on('msg:text', async (ctx) => {
  await getIdUser(ctx);
});
bot.on('msg', async (ctx) => {
  ctx.reply('Хм, похоже Вы ввели не текстовое сообщение');
  ctx.replyWithSticker(
    'CAACAgIAAxkBAAEIdxxkLSqm9I-c7S4Y7ikJvWidftBSRQACBRAAAn-WSEirjcU2x7PvmS8E',
  );
});

// Колбек на выбор кнопкок
bot.callbackQuery('yes', async (ctx) => {
  await getInfoUser(ctx);
});

bot.callbackQuery('no', async (ctx) => {
  const userId = ctx.from.id;
  users[userId] = '';
  return ctx.reply('Данные удалены, делай новый запрос');
});

// Запуск бота
bot.start();
