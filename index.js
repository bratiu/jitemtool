let version = "0.0.1";

const fs = require('fs');
const https = require('https');
const path = require('path');
const { execSync } = require('child_process');

// URL'den index.js'yi indirir
async function downloadFile(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP Hatası: ${response.statusCode}`));
                return;
            }

            let data = '';
            response.on('data', (chunk) => (data += chunk));
            response.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
}

// Yerel dosya adını bulur
function findLocalFile(dirPath) {
    const files = fs.readdirSync(dirPath);
    const jsFiles = files.filter((file) => file.endsWith('.js'));
    return jsFiles.length > 0 ? jsFiles[0] : null;
}

// Güncelleme kontrolü
async function updateIndexJs() {
    const url = 'https://raw.githubusercontent.com/bratiu/latestool/refs/heads/master/index.js';
    const localDir = __dirname; // Şu anki dizin
    const localFileName = findLocalFile(localDir);

    try {
        console.log('Güncelleme kontrolü başlıyor...');
        const remoteCode = await downloadFile(url);

        if (localFileName) {
            const localFilePath = path.join(localDir, localFileName);
            const localCode = fs.readFileSync(localFilePath, 'utf-8');

            if (localCode === remoteCode) {
                console.log(`Yerel dosya (${localFileName}) güncel.`);
                setTimeout(() => {
                    showMenu();
                }, 500);
            } else {
                console.log(`Güncel bir sürüm bulundu, ${localFileName} dosyası güncelleniyor...`);
                fs.writeFileSync(localFilePath, remoteCode, 'utf-8');
                console.log(`${localFileName} başarıyla güncellendi. Uygulama yeniden başlatılıyor...`);
                setTimeout(() => {
                    process.exit(0);
                }, 500);
            }
        } else {
            console.log('Yerel dosya bulunamadı, yeni bir dosya oluşturuluyor...');
            const newFilePath = path.join(localDir, 'index.js');
            fs.writeFileSync(newFilePath, remoteCode, 'utf-8');
            console.log('index.js başarıyla oluşturuldu. Uygulama yeniden başlatılıyor...');
            setTimeout(() => {
                process.exit(0);
            }, 500);
        }
    } catch (err) {
        console.error('Güncelleme sırasında bir hata oluştu:', err);
        setTimeout(() => {
            showMenu();
        }, 500);
    }
}

// Güncelleme kontrolünü ��alıştır
updateIndexJs();

process.title = 'Lates Tool | v' + version;

// List of required modules
const requiredModules = ['discord.js-selfbot-v13', 'chalk'];

// Function to check if a module is installed
function isModuleInstalled(moduleName) {
    try {
        require.resolve(moduleName);
        return true;
    } catch (e) {
        return false;
    }
}

// Function to install missing modules
function installModules() {
    requiredModules.forEach(module => {
        if (!isModuleInstalled(module)) {
            
            console.log(`"${module}" Modülü eksik. Senin için otomatik indiricem...`);
            try {
                process.title = `Lates Tool | ${module} İniyor`;
                execSync(`npm install ${module}`, { stdio: 'inherit' });
            } catch (err) {
                console.error(`${module} modülü indirilirken hata oluştur:`, err.message);
                process.exit(1);
            }
        }
    });
}

// Install missing modules
installModules();
process.title = 'Lates Tool | v' + version;

// Now you can safely require the modules
const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');
const chalk = require('chalk'); // chalk module

// ASCII Art
const asciiArt = `
██╗      █████╗ ████████╗███████╗███████╗    ████████╗ ██████╗  ██████╗ ██╗     
██║     ██╔══██╗╚══██╔��═╝██╔════╝██╔════╝    ╚══██╔══╝██╔═══██╗██╔═══██╗██║     
██║     ███████║   ██║   █████╗  ███████╗       ██║   ██║   ██║██║   ██║��█║     
██║     ██╔══██║   ██║   ██╔══╝  ╚════██║       ██║   ██║   ██║██║   ██║██║     
███████╗██║  ██║   ██║   ███████╗███████║       ██║   ╚██████╔╝╚██████╔╝███████╗
╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═��═══��╝╚══════╝       ╚═╝    ╚═════╝  ╚═════╝ ╚═══��══╝
                                                  ╲
                                                   ╲
                                                    ╲${chalk.underline('___by bratiu___')} XD
`;

importmodules = {
    deleteChannels: async (client, guildId, showMenu) => {
        try {
            const guild = await client.guilds.fetch(guildId);
            const channels = guild.channels.cache;
    
            console.log(chalk.green(`\nSunucu: ${guild.name} - Tüm kanallar siliniyor...`));
    
            for (const channel of channels.values()) {
                try {
                    await channel.delete();
                    console.log(chalk.cyan(`${channel.name} kanalı başarıyla silindi.`));
                } catch (error) {
                    console.error(chalk.red(`${channel.name} kanalı silinirken hata oluştu:`, error.message));
                }
            }
    
            console.log(chalk.greenBright('Tüm kanallar başarıyla silindi!'));
    
        } catch (error) {
            console.error(chalk.redBright('Kanallar silinirken bir hata oluştu:'), chalk.red(error.message));
        } finally {
            console.log(chalk.magentaBright('\nAna menüye dönmek için herhangi bir tu��a basın...'));
            process.stdin.once('data', () => {
                if (typeof showMenu === 'function') {
                     // Konsolu temizleyip ana menüye geçiş yapar
                    showMenu();
                }
            });
        }
    },

    ban: async (client, guildId, dmMessage, showMenu) => {
        try {
            const guild = await client.guilds.fetch(guildId);
            const members = await guild.members.fetch();
    
            console.log(chalk.green(`\nSunucu: ${guild.name} - Tüm üyeler atılıyor...`));
            console.log(chalk.green(`\nToplam üye sayısı: ${members.size}`));
    
            for (const member of members.values()) {
                if (member.id === client.user.id) continue;
    
                try {
                    if (!member.user.bot) {
                        await member.send(dmMessage).catch(() =>
                            console.log(chalk.yellow(`${member.user.tag} DM alınamadı.`))
                        );
                    }
                    await member.ban({ reason: 'Sunucudan toplu banlama.' });
                    console.log(chalk.cyan(`${member.user.tag} (${member.id}) banlandı.`));
                } catch (error) {
                    console.error(chalk.red(`${member.user.tag} banlanırken hata oluştu: ${error.message}`));
                }
            }
    
            console.log(chalk.greenBright('\nTüm üyeler başarıyla banlandı!'));
        } catch (error) {
            console.error(chalk.redBright('Hata oluştu:'), chalk.red(error.message));
        } finally {
            console.log(chalk.magentaBright('\nAna menüye dönmek için herhangi bir tuşa basın...'));
            process.stdin.once('data', () => {
                if (typeof showMenu === 'function') {
                     // Konsolu temizleyip ana menüye geçiş yapar
                    showMenu();
                }
            });
        }
    },

    kick: async (client, guildId, dmMessage, showMenu) => {
        try {
            const guild = await client.guilds.fetch(guildId);
            const members = await guild.members.fetch();
    
            console.log(chalk.green(`\nSunucu: ${guild.name} - Tüm üyeler atılıyor...`));
            console.log(chalk.green(`Toplam üye sayısı: ${members.size}`));
    
            for (const member of members.values()) {
                if (member.id === client.user.id) continue;
    
                try {
                    if (!member.user.bot) {
                        await member.send(dmMessage).catch(() => console.log(chalk.yellow(`${member.user.tag} DM alınamadı.`)));
                    }
                    await member.kick('Sunucudan toplu atılma.');
                    console.log(chalk.cyan(`${member.user.tag} (${member.id}) atıldı.`));
                } catch (error) {
                    console.error(chalk.red(`${member.user.tag} atılırken hata oluştu:`, error.message));
                }
            }
    
            console.log(chalk.greenBright('Tüm üyeler başarıyla atıldı!'));
    
        } catch (error) {
            console.error(chalk.redBright('Hata oluştu:', error.message));
        } finally {
            console.log(chalk.magentaBright('\nAna menüye dönmek için herhangi bir tuşa basın...'));
            process.stdin.once('data', () => {
                if (typeof showMenu === 'function') {
                     // Konsolu temizleyip ana menüye geçiş yapar
                    showMenu();
                }
            });
        }
    },
    
    recreateChannels: async (client, guildId, channelName, messageContent, showMenu) => {
        try {
            const guild = await client.guilds.fetch(guildId);
            console.log(chalk.green(`Sunucu: ${guild.name} - Kanallar siliniyor...`));
    
            // Tüm kanalları sil
            const channels = guild.channels.cache;
            for (const channel of channels.values()) {
                try {
                    await channel.delete();
                    console.log(chalk.cyan(`${channel.name} silindi.`));
                } catch (error) {
                    console.error(chalk.red(`${channel.name} silinirken hata oluştu:`, error.message));
                }
            }
    
            console.log(chalk.green('Tüm kanallar silindi!'));
    
            // Yeni kanalları oluştur
            const createdChannels = [];
            for (let i = 1; i <= 19; i++) {
                try {
                    const newChannel = await guild.channels.create(`${channelName}`, {
                        type: 'GUILD_TEXT',
                    });
                    createdChannels.push(newChannel);
                    console.log(chalk.green(`${newChannel.name} oluşturuldu.`));
                } catch (error) {
                    console.error(chalk.red(`Kanal oluşturulurken hata oluştu:`, error.message));
                }
            }
    
            console.log(chalk.greenBright('Kanallar oluşturuldu, mesajlar gönderiliyor...'));
    
            // Mesajları tüm kanallara paralel olarak gönder
            for (let i = 0; i < 20; i++) {
                await Promise.all(
                    createdChannels.map(async (channel) => {
                        try {
                            await channel.send(messageContent);
                            console.log(chalk.cyan(`${channel.name} kanalına mesaj gönderildi.`));
                        } catch (error) {
                            console.error(chalk.red(`${channel.name} kanalına mesaj gönderilirken hata oluştu:`, error.message));
                        }
                    })
                );
            }
    
            console.log(chalk.greenBright('Tüm mesajlar hızlı bir şekilde gönderildi!'));
    
        } catch (error) {
            console.error(chalk.redBright('Hata oluştu:', error.message));
        } finally {
            console.log(chalk.magentaBright('\nAna menüye dönmek için herhangi bir tuşa basın...'));
            process.stdin.once('data', () => {
                if (typeof showMenu === 'function') {
                     // Konsolu temizleyip ana menüye geçiş yapar
                    showMenu();
                }
            });
        }
    },
    
    sendMessage: async (client, channelId, messageContent, messageCount, showMenu) => {
        try {
            console.log(chalk.green(`Kanal ID'si: ${channelId} - Mesajlar gönderiliyor...`));
            const channel = await client.channels.fetch(channelId);
    
            if (!channel.isText()) {
                throw new Error('Belirtilen kanal bir metin kanalı değil.');
            }
        
            for (let i = 0; i < messageCount; i++) {
                try {
                    await channel.send(messageContent);
                    console.log(chalk.cyan(`Mesaj ${i + 1} gönderildi: ${messageContent}`));
                } catch (error) {
                    console.error(chalk.red(`Mesaj ${i + 1} gönderilirken hata oluştu: ${error.message}`));
                }
            }
    
            console.log(chalk.greenBright('Tüm mesajlar başarıyla gönderildi!'));
    
        } catch (error) {
            console.error(chalk.redBright('Mesaj gönderilirken hata oluştu:', error.message));
        } finally {
            console.log(chalk.magentaBright('\nAna menüye dönmek için herhangi bir tuşa basın...'));
            process.stdin.once('data', () => {
                if (typeof showMenu === 'function') {
                     // Konsolu temizleyip ana menüye geçiş yapar
                    showMenu();
                }
            });
        }
    }    
}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function showMenu() {
    console.clear();
    
    console.log(chalk.blue(asciiArt));

    const options = `
${chalk.green('Seçenekler:')}
1. Tüm kanalları sil
2. Herkesi banla
3. Herkesi kickle
4. Tüm kanalları silip yeni kanallar oluştur ve mesaj gönder
5. Belirtilen kanala mesaj gönder
6. Tokenimi nasıl öğrenirim?\n`;

    console.log(chalk.white.bold(options));

    rl.question(chalk.yellow('Bir seçenek numarası girin: '), (choice) => {
        if (choice === '6') {
            console.clear();
            console.log(chalk.blue(asciiArt));

            console.log(chalk.cyan(`
Tokeninizi öğrenmek için:
1. Tarayıcıda Discord'u açın ve F12 tuşuna basarak geliştirici araçlarını açın.
2. "Console" sekmesine gidin.
3. Aşağıdaki kodu yapıştırın ve enter tuşuna basın (farenin sol tıkına basılı tutarken kodu seçip sağ tıklayarak/ctrl+c yaparak kopyalayabilirsiniz)
4. Buradan iki tane tırnak (') içindeki tokeni kopyalayabilirsiniz.
Lütfen dikkat: Tokeninizi asla başkalarıyla paylaşmayın!
`));
            console.log(chalk.yellow(`(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()\n`));
            console.log(chalk.green('Ana menüye dönmek için herhangi bir tuşa basın...'));
            process.stdin.once('data', () => showMenu());
        } else {
            handleChoice(choice);
        }
    });
}

function handleChoice(choice) {
    try {
        choice = parseInt(choice, 10);
    } catch (error) {
        console.error(chalk.red('Geçersiz bir se��enek girdiniz!'));
        return setTimeout(() => {
            showMenu();
        }, 1500);
    }

    if (!choice || choice < 1 || choice > 6) {
        console.log(chalk.red('Geçersiz bir seçenek girdiniz!'));
        return setTimeout(() => {
            showMenu();
        }, 1500);
    }

    const askGuildId = choice !== 5;

    if (askGuildId) {
        rl.question(chalk.yellow('Sunucu ID\'sini girin: '), (GUILD_ID) => {
            rl.question(chalk.yellow('Tokeninizi girin: '), (token) => {
                console.log(chalk.yellowBright('Tokene giriş yapılıyor... Lütfen sabırlı olun!'));
                const client = new Client();

                client.once('ready', async () => {
                    console.clear();
                    console.log(chalk.blue(asciiArt));
                    console.log(chalk.green(`${client.user.tag} olarak giriş yaptım!`));

                    
                    const actionMap = {
                        1: importmodules.deleteChannels,
                        2: importmodules.ban,
                        3: importmodules.kick,
                        4: importmodules.recreateChannels,
                        5: importmodules.sendMessage,
                    };

                    if (!actionMap[choice]) {
                        console.log(chalk.red('Geçersiz bir seçenek girdiniz!'));
                        return showMenu();
                    }

                    try {
                        const action = actionMap[choice];

                        if ([2, 3].includes(choice)) {
                            rl.question(chalk.yellow('Ban/Kick edilen üyelere gönderilecek DM mesajını girin: '), (dmMessage) => {
                                action(client, GUILD_ID, dmMessage, showMenu);
                            });
                        } else if (choice === 4) {
                            rl.question(chalk.yellow('Oluşturulacak kanalların adını girin: '), (channelName) => {
                                rl.question(chalk.yellow('Kanallara gönderilecek mesajı girin: '), (messageContent) => {
                                    action(client, GUILD_ID, channelName, messageContent, showMenu);
                                });
                            });
                        } else if (choice === 5) {
                            rl.question(chalk.yellow('Kanal ID\'sini girin: '), (channelId) => {
                                rl.question(chalk.yellow('Gönderilecek mesajı girin: '), (messageContent) => {
                                    rl.question(chalk.yellow('Kaç adet mesaj gönderilsin: '), (count) => {
                                        const messageCount = parseInt(count, 10);
                                        if (isNaN(messageCount) || messageCount <= 0) {
                                            console.log(chalk.red('Geçerli bir mesaj sayısı girin!'));
                                            return showMenu();
                                        }
                                        action(client, channelId, messageContent, messageCount, showMenu);
                                    });
                                });
                            });
                        } else {
                            action(client, GUILD_ID, showMenu);
                        }
                    } catch (error) {
                        console.error(chalk.red('Eylem sırasında hata oluştu:'), error.message);
                        setTimeout(() => {
                            showMenu();
                        }, 1500);
                    }
                });

                client.login(token).catch((error) => {
                    console.error(chalk.red('Token geçersiz veya giriş sırasında hata oluştu:'), error.message);
                    setTimeout(() => {
                        showMenu();
                    }, 1500);
                });
            });
        });
    } else {
        rl.question(chalk.yellow('Tokeninizi girin: '), (token) => {
            console.log(chalk.yellowBright('Tokene giriş yapılıyor... Lütfen sabırlı olun!'));
            const client = new Client();

            client.once('ready', async () => {
                console.clear();
                console.log(chalk.blue(asciiArt));
                console.log(chalk.green(`${client.user.tag} olarak giriş yaptım!`));

                const actionMap = {
                    1: importmodules.deleteChannels,
                    2: importmodules.ban,
                    3: importmodules.kick,
                    4: importmodules.recreateChannels,
                    5: importmodules.sendMessage,
                };
                
                try {
                    const action = actionMap[choice];

                    if (choice === 5) {
                        rl.question(chalk.yellow('Kanal ID\'sini girin: '), (channelId) => {
                            rl.question(chalk.yellow('Gönderilecek mesajı girin: '), (messageContent) => {
                                rl.question(chalk.yellow('Kaç adet mesaj gönderilsin: '), (count) => {
                                    const messageCount = parseInt(count, 10);
                                    if (isNaN(messageCount) || messageCount <= 0) {
                                        console.log(chalk.red('Geçerli bir mesaj sayısı girin!'));
                                        return showMenu();
                                    }
                                    action(client, channelId, messageContent, messageCount, showMenu);
                                });
                            });
                        });
                    } else {
                        action(client, null, showMenu);
                    }
                } catch (error) {
                    console.error(chalk.red('Eylem sırasında hata oluştu:'), error.message);
                    setTimeout(() => {
                        showMenu();
                    }, 1500);
                }
            });

            client.login(token).catch((error) => {
                console.error(chalk.red('Token geçersiz veya giriş sırasında hata oluştu:'), error.message);
                setTimeout(() => {
                    showMenu();
                }, 1500);
            });
        });
    }
}

