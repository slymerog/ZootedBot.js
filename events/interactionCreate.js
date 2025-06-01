// events/interactionCreate.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

const userChannelTargets = new Map();

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    const isOwner = interaction.user.id === interaction.guild?.ownerId;
    const isAdmin = interaction.member?.permissions.has(PermissionsBitField.Flags.Administrator);
    const isAllowed = isOwner || isAdmin;

    if (!isAllowed && (interaction.isChatInputCommand() || interaction.isButton() || interaction.isModalSubmit() || interaction.isSelectMenu())) {
      return interaction.reply({ content: '🚫 You do not have permission to use this embed builder.', flags: 64 });
    }

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing that command.', flags: 64 });
      }
    } else if (interaction.isButton()) {
      const [action, userId] = interaction.customId.split('_');
      if (interaction.user.id !== userId) return interaction.reply({ content: 'This is not your embed builder session.', flags: 64 });

      const embed = EmbedBuilder.from(interaction.message.embeds[0]);

      const modalMap = {
        setTitle: { id: 'embedTitle', label: 'Title', style: TextInputStyle.Short },
        setDescription: { id: 'embedDescription', label: 'Description', style: TextInputStyle.Paragraph },
        setURL: { id: 'embedURL', label: 'URL', style: TextInputStyle.Short },
        setColor: { id: 'embedHexColor', label: 'Hex Color (e.g., #2f3136)', style: TextInputStyle.Short },
        setImage: { id: 'embedImage', label: 'Image URL', style: TextInputStyle.Short },
        setThumbnail: { id: 'embedThumbnail', label: 'Thumbnail URL', style: TextInputStyle.Short },
        setFooter: { id: 'embedFooter', label: 'Footer Text', style: TextInputStyle.Short },
        addField: null
      };

      if (action in modalMap && modalMap[action]) {
        const m = modalMap[action];
        const modal = new ModalBuilder()
          .setCustomId(`modal_${action}_${userId}`)
          .setTitle(`Set ${m.label}`)
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId(m.id)
                .setLabel(m.label)
                .setStyle(m.style)
                .setRequired(false)
            )
          );
        return interaction.showModal(modal);
      }

      if (action === 'addField') {
        const modal = new ModalBuilder()
          .setCustomId(`modal_addField_${userId}`)
          .setTitle('Add Embed Field')
          .addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fieldName').setLabel('Field Name').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fieldValue').setLabel('Field Value').setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('fieldInline').setLabel('Inline? (yes/no)').setStyle(TextInputStyle.Short).setRequired(true))
          );
        return interaction.showModal(modal);
      }

      if (action === 'setTimestamp') {
        embed.setTimestamp(new Date());
        return interaction.update({ embeds: [embed] });
      }

      if (action === 'resetEmbed') {
        const cleared = new EmbedBuilder().setColor(0x2f3136).setDescription('Embed preview will appear here.');
        return interaction.update({ embeds: [cleared] });
      }

      if (action === 'sendEmbed') {
        const target = userChannelTargets.get(userId);
        const channel = target ? interaction.guild.channels.cache.get(target) : interaction.channel;
        if (!embed.data.title && !embed.data.description) {
          return interaction.reply({ content: 'Embed must have a title or description!', flags: 64 });
        }
        await channel.send({ embeds: [embed] });
        return interaction.reply({ content: '✅ Embed sent!', flags: 64 });
      }

      if (action === 'chooseChannel') {
        return interaction.reply({
          content: 'Select a channel to send the embed to:',
          components: [
            new ActionRowBuilder().addComponents(
              new ChannelSelectMenuBuilder()
                .setCustomId(`selectChannel_${userId}`)
                .setPlaceholder('Select a text channel')
                .addChannelTypes(ChannelType.GuildText)
            )
          ],
          flags: 64
        });
      }

      if (action === 'manageFields') {
        if (!embed.fields?.length) {
          return interaction.reply({ content: 'There are no fields to manage.', flags: 64 });
        }

        const menu = new StringSelectMenuBuilder()
          .setCustomId(`editField_${userId}`)
          .setPlaceholder('Select a field to remove')
          .addOptions(embed.fields.map((f, i) => ({ label: f.name, value: i.toString() })));

        return interaction.reply({
          content: 'Select a field to remove:',
          components: [new ActionRowBuilder().addComponents(menu)],
          flags: 64
        });
      }
    } else if (interaction.isChannelSelectMenu()) {
      const [_, userId] = interaction.customId.split('_');
      const selected = interaction.values[0];
      userChannelTargets.set(userId, selected);
      return interaction.reply({ content: `📢 Embed will now be sent to <#${selected}>.`, flags: 64 });
    } else if (interaction.isStringSelectMenu()) {
      const [_, userId] = interaction.customId.split('_');
      const index = parseInt(interaction.values[0], 10);
      const embed = EmbedBuilder.from(interaction.message.embeds[0]);
      embed.fields.splice(index, 1);
      return interaction.update({ embeds: [embed], components: [] });
    } else if (interaction.isModalSubmit()) {
      const [_, action, userId] = interaction.customId.split('_');
      const embed = EmbedBuilder.from(interaction.message.embeds[0]);

      if (action === 'addField') {
        const name = interaction.fields.getTextInputValue('fieldName');
        const value = interaction.fields.getTextInputValue('fieldValue');
        const inline = interaction.fields.getTextInputValue('fieldInline').toLowerCase() === 'yes';
        embed.addFields({ name, value, inline });
        return interaction.update({ embeds: [embed] });
      }

      const valueMap = {
        setTitle: 'embedTitle',
        setDescription: 'embedDescription',
        setURL: 'embedURL',
        setColor: 'embedHexColor',
        setImage: 'embedImage',
        setThumbnail: 'embedThumbnail',
        setFooter: 'embedFooter'
      };

      const fieldId = valueMap[action];
      if (!fieldId) return;
      const value = interaction.fields.getTextInputValue(fieldId);

      switch (action) {
        case 'setTitle': value ? embed.setTitle(value) : embed.setTitle(null); break;
        case 'setDescription': value ? embed.setDescription(value) : embed.setDescription(null); break;
        case 'setURL': value ? embed.setURL(value) : embed.setURL(null); break;
        case 'setColor': value ? embed.setColor(value.replace('#', '')) : embed.setColor(null); break;
        case 'setImage': value ? embed.setImage(value) : embed.setImage(null); break;
        case 'setThumbnail': value ? embed.setThumbnail(value) : embed.setThumbnail(null); break;
        case 'setFooter': value ? embed.setFooter({ text: value }) : embed.setFooter(null); break;
      }

      await interaction.update({ embeds: [embed] });
    }
  }
};
