const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();

// ===== CONFIG =====
const PORT = 3000;
const pastaPrincipal = "C:/Users/tadeu/Desktop/entradas_WS";

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ===== FUNÇÃO LIMPAR NOME =====
function limparNome(nome){
    return nome.replace(/[<>:"/\\|?*]/g, "").trim();
}

// ===== MULTER STORAGE =====
const storage = multer.diskStorage({

    destination: function(req, file, cb){

        try{

            let nota = req.body.nota || "SEM_NOTA";
            nota = limparNome(nota);

            const pastaNota = path.join(pastaPrincipal, nota);

            fs.mkdirSync(pastaNota, { recursive: true });

            cb(null, pastaNota);

        }catch(err){
            cb(err);
        }
    },

    filename: function(req, file, cb){
        cb(null, Date.now() + ".jpg");
    }

});

const upload = multer({ storage });

// ===== ROTA UPLOAD =====
app.post("/upload", upload.array("fotos"), (req, res) => {

    try{

        if (!req.body.nota){
            return res.status(400).send("Nota não enviada");
        }

        console.log("📦 Nota:", req.body.nota);
        console.log("📷 Fotos recebidas:", req.files.length);

        res.send("Upload OK");

    }catch(err){

        console.error(err);
        res.status(500).send("Erro no servidor");

    }

});

// ===== DESCOBRIR IP DA MÁQUINA =====
function pegarIP(){
    const nets = os.networkInterfaces();

    for (const name of Object.keys(nets)){
        for (const net of nets[name]){

            if(net.family === "IPv4" && !net.internal){
                return net.address;
            }

        }
    }
    return "localhost";
}

// ===== START SERVIDOR =====
app.listen(PORT, "0.0.0.0", () => {

    const ip = pegarIP();

    console.log("Servidor rodando:");
    console.log("👉 Local: http://localhost:" + PORT);
    console.log("👉 Rede : http://" + ip + ":" + PORT);

});