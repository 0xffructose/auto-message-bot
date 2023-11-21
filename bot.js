const { Client, MessageEmbed } = require("discord.js-selfbot-v13");
const { config } = require("dotenv");  
const fs = require("node:fs")

config();

const client = new Client({ checkUpdate: false });
const prefix = process.env.PREFIX;

client.on("ready" , () => {
    console.log("NonFungibleWest Bot | Aktif !");
    
});

client.on("messageCreate" , (message) => {
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase()

    if (!message.content.startsWith(prefix)) return;
    if (message.author.id !== process.env.OWNER) return;

    if (command === "reklam-yap") {

        const file = JSON.parse(fs.readFileSync('servers.json', 'utf-8'))
        const advertisement = JSON.parse(fs.readFileSync('ads.json' , 'utf-8'))

        Object.entries(file).forEach(async ([key , value]) => {
            let ch = client.guilds.cache.get(key).channels.cache.get(value)
            ch.sendTyping()
            setTimeout(() => {
                makeAdvertisement(ch , advertisement["advertisement"])
                
            }, 5000)
        });

        setTimeout(() => {
            client.users.cache.get(process.env.OWNER).send(":white_check_mark: Reklam " + `${Object.keys(file).length} sunucuda ` + "başarıyla yapıldı !" )
        }, 5000)
    } else if (command === "sunucu-ekle") {
        if (client.guilds.cache.get(args[0]) == null) { client.users.cache.get(process.env.OWNER).send(":x: Bu sunucuda ekli değilim"); return; }

        const file = JSON.parse(fs.readFileSync('servers.json' , 'utf-8'));
        file[args[0]] = args[1]
        fs.writeFileSync('servers.json' , JSON.stringify(file) , err => {
            if (err) console.error(err)
        })
    } else if (command === "yardım") {
        message.channel.send("**.reklam-yap** -> Ekli olduğu sunucuların belirtilen kanallarına reklam metnini gönderir\n**.sunucu-ekle `[sunucu-id]` `[kanal-id]`** -> Ekli olduğu sunucuları ve belirtilen kanallarını listeye ekler\n**.oto-reklam** -> Ekli olduğu sunucuların belirtilen kanallarından periyodik olarak reklam yapar")
    } else if (command === "oto-reklam") {
        const file = JSON.parse(fs.readFileSync('config.json' , 'utf-8'))
        
        if (file["oto-reklam"]) { 
            file["oto-reklam"] = false; message.author.send(":warning: Oto reklam kapatıldı"); 
            stopAutoAds()
            fs.writeFileSync('config.json' , JSON.stringify(file) , err => { if (err) console.error(err) })
        }
        else { 
            file["oto-reklam"] = true;
            message.author.send(":warning: Oto reklam açıldı");
            setAutoAds(file["bekleme"])
            fs.writeFileSync('config.json' , JSON.stringify(file) , err => { if (err) console.error(err) })
        }
    }
});

function makeAdvertisement(channel , message) {
    channel.send(message)
}

let myInterval = null;

function setAutoAds(interval) {
    const file = JSON.parse(fs.readFileSync('servers.json', 'utf-8'))
    const advertisement = JSON.parse(fs.readFileSync('ads.json' , 'utf-8'))
    
    myInterval = setInterval(() => {
        
        Object.entries(file).forEach(async ([key , value]) => {
            let ch = client.guilds.cache.get(key).channels.cache.get(value)
            ch.sendTyping()
            setTimeout(() => {
                makeAdvertisement(ch , advertisement["advertisement"])
            }, 5000)
        });

        setTimeout(() => {
            client.users.cache.get(process.env.OWNER).send(":white_check_mark: Reklam " + `${Object.keys(file).length} sunucuda ` + "başarıyla yapıldı !" )
        }, 5000)
    } , interval)
}

function stopAutoAds() { clearInterval(myInterval); }

client.login(process.env.TOKEN)
