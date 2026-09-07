/************************************************

 CONFIGURAÇÕES

************************************************/


const SUPABASE_URL =
    "https://gmizhmkichnkzsdaznjg.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_4j1VkO20dQG7R6oMYRMwgA_V9HYVRri";


const BUCKET =
    "fotos-casamento";


const SENHA_ADMIN =
    "CASAMENTO2026";



/************************************************

 CONEXÃO SUPABASE

************************************************/


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );



/************************************************

 VARIÁVEIS

************************************************/


let fotoSelecionada = null;



/************************************************

 TROCAR TELAS

************************************************/


function esconderTodasTelas() {

    const telas =
        document.querySelectorAll(".tela");


    telas.forEach(function (tela) {

        tela.classList.remove("ativa");

    });

}



function mostrarTela(id) {

    esconderTodasTelas();


    document
        .getElementById(id)
        .classList
        .add("ativa");

}



/************************************************

 ABRIR SELETOR DE FOTO

 IMPORTANTE:
 NÃO USAMOS capture="camera"

 Isso evita forçar a câmera.

 O celular poderá apresentar
 câmera e/ou galeria conforme
 o sistema operacional.

************************************************/


function abrirSeletorFoto() {

    const input =
        document.getElementById("inputFoto");


    input.value = "";


    input.click();

}



/************************************************

 FOTO SELECIONADA

************************************************/


function selecionarFoto(event) {

    const arquivo =
        event.target.files[0];


    if (!arquivo) {

        return;

    }


    if (!arquivo.type.startsWith("image/")) {

        alert(
            "Por favor, selecione apenas uma imagem."
        );

        return;

    }


    fotoSelecionada =
        arquivo;


    const preview =
        document.getElementById("previewFoto");


    const nomeArquivo =
        document.getElementById("nomeArquivo");


    const leitor =
        new FileReader();


    leitor.onload =
        function (e) {

            preview.src =
                e.target.result;

        };


    leitor.readAsDataURL(
        arquivo
    );


    nomeArquivo.innerText =
        arquivo.name;


    mostrarTela(
        "envioTela"
    );

}



/************************************************

 ENVIAR FOTO

************************************************/


async function enviarFoto() {

    if (!fotoSelecionada) {

        alert(
            "Nenhuma foto foi selecionada."
        );

        return;

    }


    const botao =
        document.getElementById(
            "botaoEnviar"
        );


    botao.disabled = true;


    botao.innerText =
        "⏳ Enviando...";


    mostrarProgresso();


    try {


        const extensao =
            fotoSelecionada.name
            .split(".")
            .pop();


        const agora =
            new Date();


        const nomeArquivo =

            agora.getFullYear() +
            "-" +

            String(
                agora.getMonth() + 1
            ).padStart(2, "0") +

            "-" +

            String(
                agora.getDate()
            ).padStart(2, "0") +

            "_" +

            agora.getTime() +

            "_" +

            Math.random()
            .toString(36)
            .substring(2, 8)

            +

            "." +

            extensao;


        const caminho =

            "aguardando/" +

            nomeArquivo;


        atualizarProgresso(
            30,
            "Enviando sua foto..."
        );


        const {

            data,

            error

        }

        =

        await supabaseClient
        .storage
        .from(BUCKET)
        .upload(

            caminho,

            fotoSelecionada,

            {

                contentType:
                    fotoSelecionada.type,

                upsert:
                    false

            }

        );


        if (error) {

            throw error;

        }


        atualizarProgresso(
            100,
            "Foto enviada!"
        );


        setTimeout(
            function () {

                alert(
                    "🎉 Foto enviada com sucesso!\n\nAgora ela aguardará aprovação."
                );


                fotoSelecionada =
                    null;


                voltarInicio();

            },

            500
        );


    }

    catch (erro) {


        console.error(
            erro
        );


        alert(

            "❌ Erro ao enviar a foto.\n\n" +

            erro.message

        );


    }

    finally {


        botao.disabled =
            false;


        botao.innerText =
            "☁️ Enviar Foto";


    }

}



/************************************************

 PROGRESSO

************************************************/


function mostrarProgresso() {

    const container =
        document.getElementById(
            "progressoContainer"
        );


    container.classList.remove(
        "escondido"
    );


    atualizarProgresso(
        10,
        "Preparando envio..."
    );

}



function atualizarProgresso(
    porcentagem,
    texto
) {

    document
        .getElementById(
            "barraProgresso"
        )
        .style.width =

        porcentagem + "%";


    document
        .getElementById(
            "textoProgresso"
        )
        .innerText =

        texto;

}



/************************************************

 CANCELAR ENVIO

************************************************/


function cancelarEnvio() {

    fotoSelecionada =
        null;


    document
        .getElementById(
            "inputFoto"
        )
        .value = "";


    document
        .getElementById(
            "previewFoto"
        )
        .src = "";


    document
        .getElementById(
            "progressoContainer"
        )
        .classList
        .add(
            "escondido"
        );


    abrirSeletorFoto();

}



/************************************************

 ABRIR SENHA

************************************************/


function abrirSenha() {

    document
        .getElementById(
            "senha"
        )
        .value = "";


    document
        .getElementById(
            "erroSenha"
        )
        .innerText = "";


    mostrarTela(
        "senhaTela"
    );

}



/************************************************

 VALIDAR SENHA

************************************************/


function validarSenha() {

    const senha =

        document
        .getElementById(
            "senha"
        )
        .value;


    const erro =

        document
        .getElementById(
            "erroSenha"
        );


    if (

        senha ===
        SENHA_ADMIN

    ) {


        erro.innerText =
            "";


        mostrarTela(
            "validacaoTela"
        );


        carregarFotosPendentes();


    }

    else {


        erro.innerText =
            "❌ Senha incorreta!";


    }

}



/************************************************

 FOTOS PENDENTES

************************************************/


async function carregarFotosPendentes() {

    const lista =

        document
        .getElementById(
            "listaPendentes"
        );


    lista.innerHTML =

        '<p class="carregando">⏳ Carregando fotos...</p>';


    try {


        const {

            data: arquivos,

            error

        }

        =

        await supabaseClient
        .storage
        .from(BUCKET)
        .list(

            "aguardando",

            {

                limit: 1000,

                sort: {

                    column:
                        "created_at",

                    order:
                        "desc"

                }

            }

        );


        if (error) {

            throw error;

        }


        lista.innerHTML =
            "";


        const fotos =

            arquivos.filter(
                arquivo =>
                    arquivo.name &&
                    !arquivo.name.startsWith(".")
            );


        if (

            fotos.length === 0

        ) {


            lista.innerHTML =

                '<p class="sem-fotos">' +

                '📭 Nenhuma foto aguardando aprovação.' +

                '</p>';


            return;

        }


        fotos.forEach(

            function (arquivo) {


                criarFotoPendente(
                    arquivo
                );


            }

        );


    }

    catch (erro) {


        console.error(
            erro
        );


        lista.innerHTML =

            '<p class="erro">' +

            '❌ Erro ao carregar as fotos.<br><br>' +

            erro.message +

            '</p>';


    }

}



/************************************************

 CRIAR CARD PENDENTE

************************************************/


function criarFotoPendente(
    arquivo
) {


    const lista =

        document
        .getElementById(
            "listaPendentes"
        );


    const caminho =

        "aguardando/" +

        arquivo.name;


    const {

        data: urlData

    }

    =

    supabaseClient
    .storage
    .from(BUCKET)
    .getPublicUrl(
        caminho
    );


    const card =

        document.createElement(
            "div"
        );


    card.className =
        "foto-card";


    const imagem =

        document.createElement(
            "img"
        );


    imagem.src =
        urlData.publicUrl;


    imagem.alt =
        "Foto enviada";


    imagem.loading =
        "lazy";


    imagem.onerror =
        function () {

            console.error(
                "Erro ao carregar imagem:",
                imagem.src
            );

        };


    const botoes =

        document.createElement(
            "div"
        );


    botoes.className =
        "botoes-foto";


    const aprovar =

        document.createElement(
            "button"
        );


    aprovar.className =
        "aprovar";


    aprovar.innerText =
        "✅ Aprovar";


    aprovar.onclick =
        function () {

            aprovarFoto(
                arquivo.name
            );

        };


    const reprovar =

        document.createElement(
            "button"
        );


    reprovar.className =
        "reprovar";


    reprovar.innerText =
        "❌ Bloquear";


    reprovar.onclick =
        function () {

            reprovarFoto(
                arquivo.name
            );

        };


    botoes.appendChild(
        aprovar
    );


    botoes.appendChild(
        reprovar
    );


    card.appendChild(
        imagem
    );


    card.appendChild(
        botoes
    );


    lista.appendChild(
        card
    );

}



/************************************************

 APROVAR FOTO

 MOVE:
 aguardando/
 PARA:
 aprovadas/

************************************************/


async function aprovarFoto(
    nome
) {


    const confirmar =

        confirm(
            "Deseja aprovar esta foto?"
        );


    if (!confirmar) {

        return;

    }


    try {


        const origem =

            "aguardando/" +

            nome;


        const destino =

            "aprovadas/" +

            nome;


        const {

            error

        }

        =

        await supabaseClient
        .storage
        .from(BUCKET)
        .move(
            origem,
            destino
        );


        if (error) {

            throw error;

        }


        alert(
            "✅ Foto aprovada!"
        );


        carregarFotosPendentes();


    }

    catch (erro) {


        console.error(
            erro
        );


        alert(

            "❌ Erro ao aprovar a foto.\n\n" +

            erro.message

        );


    }

}



/************************************************

 REPROVAR FOTO

 MOVE:
 aguardando/
 PARA:
 reprovadas/

************************************************/


async function reprovarFoto(
    nome
) {


    const confirmar =

        confirm(
            "Deseja bloquear esta foto?"
        );


    if (!confirmar) {

        return;

    }


    try {


        const origem =

            "aguardando/" +

            nome;


        const destino =

            "reprovadas/" +

            nome;


        const {

            error

        }

        =

        await supabaseClient
        .storage
        .from(BUCKET)
        .move(
            origem,
            destino
        );


        if (error) {

            throw error;

        }


        alert(
            "❌ Foto bloqueada."
        );


        carregarFotosPendentes();


    }

    catch (erro) {


        console.error(
            erro
        );


        alert(

            "❌ Erro ao bloquear a foto.\n\n" +

            erro.message

        );


    }

}



/************************************************

 VISUALIZAR FOTOS APROVADAS

************************************************/


async function visualizarFotos() {

    mostrarTela(
        "galeriaTela"
    );


    carregarFotosAprovadas();

}



/************************************************

 CARREGAR FOTOS APROVADAS

************************************************/


async function carregarFotosAprovadas() {

    const galeria =

        document
        .getElementById(
            "galeriaFotos"
        );


    galeria.innerHTML =

        '<p class="carregando">⏳ Carregando fotos...</p>';


    try {


        const {

            data: arquivos,

            error

        }

        =

        await supabaseClient
        .storage
        .from(BUCKET)
        .list(

            "aprovadas",

            {

                limit: 1000,

                sort: {

                    column:
                        "created_at",

                    order:
                        "desc"

                }

            }

        );


        if (error) {

            throw error;

        }


        galeria.innerHTML =
            "";


        const fotos =

            arquivos.filter(
                arquivo =>
                    arquivo.name &&
                    !arquivo.name.startsWith(".")
            );


        if (

            fotos.length === 0

        ) {


            galeria.innerHTML =

                '<p class="sem-fotos">' +

                '📭 Ainda não existem fotos aprovadas.' +

                '</p>';


            return;

        }


        fotos.forEach(

            function (arquivo) {


                criarFotoGaleria(
                    arquivo
                );


            }

        );


    }

    catch (erro) {


        console.error(
            erro
        );


        galeria.innerHTML =

            '<p class="erro">' +

            '❌ Não foi possível carregar as fotos.<br><br>' +

            erro.message +

            '</p>';


    }

}



/************************************************

 CRIAR FOTO DA GALERIA

************************************************/


function criarFotoGaleria(
    arquivo
) {


    const galeria =

        document
        .getElementById(
            "galeriaFotos"
        );


    const caminho =

        "aprovadas/" +

        arquivo.name;


    const {

        data: urlData

    }

    =

    supabaseClient
    .storage
    .from(BUCKET)
    .getPublicUrl(
        caminho
    );


    const card =

        document.createElement(
            "div"
        );


    card.className =
        "foto-galeria";


    const imagem =

        document.createElement(
            "img"
        );


    imagem.src =
        urlData.publicUrl;


    imagem.alt =
        "Foto do casamento";


    imagem.loading =
        "lazy";


    imagem.onclick =
        function () {

            abrirImagem(
                urlData.publicUrl
            );

        };


    imagem.onerror =
        function () {

            console.error(
                "Não foi possível carregar:",
                imagem.src
            );

        };


    card.appendChild(
        imagem
    );


    galeria.appendChild(
        card
    );

}



/************************************************

 ABRIR FOTO GRANDE

************************************************/


function abrirImagem(
    url
) {


    const novaJanela =

        window.open(
            "",
            "_blank"
        );


    novaJanela.document.write(

        `

        <!DOCTYPE html>

        <html>

        <head>

            <title>Foto do Casamento</title>

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            >

            <style>

                body {

                    margin: 0;

                    background: #111;

                    display: flex;

                    justify-content: center;

                    align-items: center;

                    min-height: 100vh;

                }


                img {

                    max-width: 100%;

                    max-height: 100vh;

                    object-fit: contain;

                }

            </style>

        </head>


        <body>

            <img src="${url}">

        </body>

        </html>

        `

    );

}



/************************************************

 SAIR DA VALIDAÇÃO

************************************************/


function sairValidacao() {

    voltarInicio();

}



/************************************************

 VOLTAR INÍCIO

************************************************/


function voltarInicio() {


    fotoSelecionada =
        null;


    document
        .getElementById(
            "inputFoto"
        )
        .value = "";


    document
        .getElementById(
            "previewFoto"
        )
        .src = "";


    document
        .getElementById(
            "progressoContainer"
        )
        .classList
        .add(
            "escondido"
        );


    mostrarTela(
        "inicio"
    );

}
