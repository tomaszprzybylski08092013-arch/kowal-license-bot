import "dotenv/config";
import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { commandDefinitions } from "./commands.js";
import { createDaysLicense, createLifetimeLicense, getLicenseInfo, revokeLicense } from "./api.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

const rest = new REST({ version: "10" }).setToken(token);
await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
  body: commandDefinitions
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    if (interaction.commandName === "license-create-days") {
      const days = interaction.options.getInteger("days", true);
      const note = interaction.options.getString("note") ?? "";
      const response = await createDaysLicense(days, note);
      if (!response.success) {
        await interaction.editReply(`Nie udalo sie utworzyc licencji: ${response.message}`);
        return;
      }

      await interaction.editReply([
        `Utworzono licencje na ${days} dni.`,
        `Klucz: ${response.license.licenseKey}`,
        `Status: ${response.license.status}`
      ].join("\n"));
      return;
    }

    if (interaction.commandName === "license-create-lifetime") {
      const note = interaction.options.getString("note") ?? "";
      const response = await createLifetimeLicense(note);
      if (!response.success) {
        await interaction.editReply(`Nie udalo sie utworzyc licencji: ${response.message}`);
        return;
      }

      await interaction.editReply([
        "Utworzono licencje lifetime.",
        `Klucz: ${response.license.licenseKey}`,
        `Status: ${response.license.status}`
      ].join("\n"));
      return;
    }

    if (interaction.commandName === "license-info") {
      const key = interaction.options.getString("key", true);
      const response = await getLicenseInfo(key);
      if (!response.success) {
        await interaction.editReply(`Nie znaleziono licencji: ${key}`);
        return;
      }

      const { license } = response;
      await interaction.editReply([
        `Klucz: ${license.licenseKey}`,
        `Status: ${license.status}`,
        `Typ: ${license.durationType}`,
        `Dni: ${license.durationValue ?? "lifetime"}`,
        `Aktywowana: ${license.activatedAt ?? "jeszcze nie"}`,
        `Wygasa: ${license.expiresAt ?? "lifetime"}`,
        `Install ID: ${license.boundInstallId ?? "brak"}`
      ].join("\n"));
      return;
    }

    if (interaction.commandName === "license-revoke") {
      const key = interaction.options.getString("key", true);
      const response = await revokeLicense(key);
      await interaction.editReply(response.success
        ? `Licencja ${key} zostala uniewazniona.`
        : `Nie udalo sie uniewaznic licencji ${key}.`
      );
    }
  } catch (error) {
    await interaction.editReply(`Blad bota: ${error.message}`);
  }
});

client.login(token);
