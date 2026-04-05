import "dotenv/config";
import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { commandDefinitions } from "./commands.js";
import { createDaysLicense, createLifetimeLicense, getLicenseInfo, getLicenseInfoByNick, listLicenses, revokeLicense } from "./api.js";

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

const dateTimeFormatter = new Intl.DateTimeFormat("pl-PL", {
  timeZone: "Europe/Warsaw",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

function formatDateTime(value) {
  if (!value) {
    return "brak";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(date);
}

function formatLicenseDetails(license) {
  return [
    `Klucz: ${license.licenseKey}`,
    `Nick: ${license.minecraftNick ?? "brak"}`,
    `Status: ${license.status}`,
    `Typ: ${license.durationType}`,
    `Dni: ${license.durationValue ?? "lifetime"}`,
    `Aktywowana: ${license.activatedAt ? formatDateTime(license.activatedAt) : "jeszcze nie"}`,
    `Wygasa: ${license.expiresAt ? formatDateTime(license.expiresAt) : "lifetime"}`,
    `Install ID: ${license.boundInstallId ?? "brak"}`
  ].join("\n");
}

function formatLicensePage(title, response) {
  if (!response.items || response.items.length === 0) {
    return `${title}\nBrak licencji na tej stronie.`;
  }

  const blocks = response.items.map((license, index) => [
    `${index + 1}. ${license.licenseKey}`,
    `Nick: ${license.minecraftNick ?? "brak"}`,
    `Status: ${license.status}`,
    `Typ: ${license.durationType}${license.durationValue ? ` (${license.durationValue} dni)` : ""}`,
    `Aktywowana: ${license.activatedAt ? formatDateTime(license.activatedAt) : "jeszcze nie"}`,
    `Wygasa: ${license.expiresAt ? formatDateTime(license.expiresAt) : "lifetime"}`
  ].join("\n")).join("\n\n");

  return [
    `${title}`,
    `Strona: ${response.page}/${response.totalPages}`,
    `Liczba licencji: ${response.total}`,
    "",
    blocks
  ].join("\n");
}

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
      const minecraftNick = interaction.options.getString("nick", true);
      const days = interaction.options.getInteger("days", true);
      const note = interaction.options.getString("note") ?? "";
      const response = await createDaysLicense(days, minecraftNick, note);
      if (!response.success) {
        await interaction.editReply(`Nie udalo sie utworzyc licencji: ${response.message}`);
        return;
      }

      await interaction.editReply([
        `Utworzono licencje na ${days} dni.`,
        `Klucz: ${response.license.licenseKey}`,
        `Nick: ${response.license.minecraftNick}`,
        `Status: ${response.license.status}`
      ].join("\n"));
      return;
    }

    if (interaction.commandName === "license-create-lifetime") {
      const minecraftNick = interaction.options.getString("nick", true);
      const note = interaction.options.getString("note") ?? "";
      const response = await createLifetimeLicense(minecraftNick, note);
      if (!response.success) {
        await interaction.editReply(`Nie udalo sie utworzyc licencji: ${response.message}`);
        return;
      }

      await interaction.editReply([
        "Utworzono licencje lifetime.",
        `Klucz: ${response.license.licenseKey}`,
        `Nick: ${response.license.minecraftNick}`,
        `Status: ${response.license.status}`
      ].join("\n"));
      return;
    }

    if (interaction.commandName === "license-info") {
      const key = interaction.options.getString("key");
      const nick = interaction.options.getString("nick");
      if (!key && !nick) {
        await interaction.editReply("Musisz podac klucz licencji albo nick Minecraft.");
        return;
      }

      const response = key ? await getLicenseInfo(key) : await getLicenseInfoByNick(nick);
      if (!response.success) {
        await interaction.editReply(`Nie znaleziono licencji dla podanych danych.`);
        return;
      }

      await interaction.editReply(formatLicenseDetails(response.license));
      return;
    }

    if (interaction.commandName === "license-revoke") {
      const key = interaction.options.getString("key", true);
      const response = await revokeLicense(key);
      await interaction.editReply(response.success
        ? `Licencja ${key} zostala uniewazniona.`
        : `Nie udalo sie uniewaznic licencji ${key}.`
      );
      return;
    }

    if (interaction.commandName === "all-license") {
      const page = interaction.options.getInteger("page") ?? 1;
      const response = await listLicenses("all", page);
      if (!response.success) {
        await interaction.editReply(`Nie udalo sie pobrac listy licencji.`);
        return;
      }

      await interaction.editReply(formatLicensePage("Wszystkie licencje", response));
      return;
    }

    if (interaction.commandName === "all-license-active") {
      const page = interaction.options.getInteger("page") ?? 1;
      const response = await listLicenses("active", page);
      if (!response.success) {
        await interaction.editReply(`Nie udalo sie pobrac listy aktywnych licencji.`);
        return;
      }

      await interaction.editReply(formatLicensePage("Aktywne licencje", response));
    }
  } catch (error) {
    await interaction.editReply(`Blad bota: ${error.message}`);
  }
});

client.login(token);
