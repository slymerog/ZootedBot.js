// commands/embedbuilder.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelSelectMenuBuilder,
  ComponentType,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('Launch an interactive embed builder'),

  async execute(interaction) {
    const isOwner = interaction.user.id === interaction.guild?.ownerId;
    const isAdmin = interaction.member?.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!isOwner && !isAdmin) {
      return interaction.reply({
        content: '🚫 You do not have permission to use this embed builder.',
        ephemeral: true
      });
    }

    const userId = interaction.user.id;

    const previewEmbed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription('Embed preview will appear here.');

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`setTitle_${userId}`).setLabel('📝 Title').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`setDescription_${userId}`).setLabel('📄 Description').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`setURL_${userId}`).setLabel('🌐 URL').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`setColor_${userId}`).setLabel('🎨 Color').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`setImage_${userId}`).setLabel('🖼️ Image').setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`setThumbnail_${userId}`).setLabel('🖼️ Thumb').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`setFooter_${userId}`).setLabel('🐾 Footer').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`setTimestamp_${userId}`).setLabel('🕓 Timestamp').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`addField_${userId}`).setLabel('➕ Add Field').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`resetEmbed_${userId}`).setLabel('♻️ Reset').setStyle(ButtonStyle.Danger)
    );

    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`manageFields_${userId}`).setLabel('🛠️ Manage Fields').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`chooseChannel_${userId}`).setLabel('📢 Choose Channel').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`sendEmbed_${userId}`).setLabel('✅ Send').setStyle(ButtonStyle.Success).setDisabled(false)
    );

    await interaction.reply({
      content: 'Use the buttons below to build your embed:',
      embeds: [previewEmbed],
      components: [row1, row2, row3],
      flags: MessageFlags.Ephemeral
    });
  }
};
