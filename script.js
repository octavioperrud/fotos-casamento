/************************************************

 CONFIGURAÇÕES SUPABASE

************************************************/


const SUPABASE_URL =
    "https://gmizhmkichnkzsdaznjg.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_4j1VkO20dQG7R6oMYRMwgA_V9HYVRri";


const BUCKET =
    "fotos-casamento";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );



/************************************************

 CONFIGURAÇÕES

************************************************/


const SENHA_ADMIN =
    "CASAMENTO2026";



/************************************************

 CONFIGURAÇÕES DE OTIMIZAÇÃO DAS FOTOS

************************************************/


const TAMANHO_MAXIMO_IMAGEM =
    2400;


/*
    Objetivo aproximado:

    2 MB
*/


const TAMANHO_ALVO =
    2 * 1024 * 1024;


/*
    Qualidade inicial da imagem.
*/


const QUALIDADE_INICIAL =
    0.88;


/*
    Qualidade mínima permitida.

    Não vamos reduzir excessivamente
    para preservar a qualidade.
*/


const QUALIDADE_MINIMA =
    0.55;



/************************************************

 VARIÁVEIS

************************************************/


let fotoSelecionada = null;


let modoGaleria =
    "pendentes";


let fotosApresentacao = [];


let intervaloApresentacao = null;


let intervaloAtualizacaoApresentacao = null;



/************************************************

 ABRIR ENVIO

************************************************/


function abrirEnvio() {


    esconderTodasTelas();


    document
        .getElementById("envioTela")
        .classList
        .remove("escondido");


}



/************************************************

 PREVIEW DA FOTO

************************************************/


document
    .getElementById("fotoInput")
    .addEventListener(
        "change",
        function(event) {


            const arquivo =
                event.target.files[0];


            if (!arquivo) {


                return;


            }


            fotoSelecionada =
                arquivo;


            const imagem =

                document
                .getElementById(
                    "previewImagem"
                );


            imagem.src =
                URL.createObjectURL(
                    arquivo
                );


            document
                .getElementById(
                    "previewContainer"
                )
                .classList
                .remove(
                    "escondido"
                );


        }
    );



/************************************************

 OTIMIZAR FOTO

 Reduz resolução e tamanho antes
 de enviar para o Supabase.

************************************************/


async function otimizarFoto(
    arquivo
) {


    return new Promise(
        function(resolve, reject) {


            const imagem =
                new Image();


            const urlImagem =
                URL.createObjectURL(
                    arquivo
                );


            imagem.onload =
                async function() {


                    try {


                        let largura =
                            imagem.width;


                        let altura =
                            imagem.height;


                        /*
                            Redimensiona apenas se
                            ultrapassar o tamanho máximo.
                        */


                        if (
                            largura >
                            TAMANHO_MAXIMO_IMAGEM
                        ) {


                            altura =
                                Math.round(

                                    altura *

                                    (
                                        TAMANHO_MAXIMO_IMAGEM /
                                        largura
                                    )

                                );


                            largura =
                                TAMANHO_MAXIMO_IMAGEM;


                        }


                        else if (
                            altura >
                            TAMANHO_MAXIMO_IMAGEM
                        ) {


                            largura =
                                Math.round(

                                    largura *

                                    (
                                        TAMANHO_MAXIMO_IMAGEM /
                                        altura
                                    )

                                );


                            altura =
                                TAMANHO_MAXIMO_IMAGEM;


                        }


                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        const contexto =
                            canvas.getContext(
                                "2d"
                            );


                        canvas.width =
                            largura;


                        canvas.height =
                            altura;


                        contexto.drawImage(
                            imagem,
                            0,
                            0,
                            largura,
                            altura
                        );


                        let qualidade =
                            QUALIDADE_INICIAL;


                        let blob =
                            await gerarBlobImagem(
                                canvas,
                                qualidade
                            );


                        /*
                            Reduz gradualmente
                            a qualidade até tentar
                            chegar próximo de 2 MB.
                        */


                        while (

                            blob.size >
                            TAMANHO_ALVO

                            &&

                            qualidade >
                            QUALIDADE_MINIMA

                        ) {


                            qualidade =
                                qualidade -
                                0.05;


                            blob =
                                await gerarBlobImagem(
                                    canvas,
                                    qualidade
                                );


                        }


                        /*
                            Caso ainda esteja acima
                            de 2 MB, reduz a resolução
                            gradualmente.

                            Mesmo assim, nunca bloqueia
                            o envio da foto.
                        */


                        let tentativas =
                            0;


                        while (

                            blob.size >
                            TAMANHO_ALVO

                            &&

                            tentativas < 4

                        ) {


                            largura =
                                Math.round(
                                    largura * 0.85
                                );


                            altura =
                                Math.round(
                                    altura * 0.85
                                );


                            const novoCanvas =
                                document.createElement(
                                    "canvas"
                                );


                            const novoContexto =
                                novoCanvas.getContext(
                                    "2d"
                                );


                            novoCanvas.width =
                                largura;


                            novoCanvas.height =
                                altura;


                            novoContexto.drawImage(
                                imagem,
                                0,
                                0,
                                largura,
                                altura
                            );


                            blob =
                                await gerarBlobImagem(
                                    novoCanvas,
                                    QUALIDADE_MINIMA
                                );


                            tentativas++;


                        }


                        URL.revokeObjectURL(
                            urlImagem
                        );


                        resolve(
                            blob
                        );


                    }


                    catch (erro) {


                        URL.revokeObjectURL(
                            urlImagem
                        );


                        reject(
                            erro
                        );


                    }


                };


            imagem.onerror =
                function() {


                    URL.revokeObjectURL(
                        urlImagem
                    );


                    reject(
                        new Error(
                            "Não foi possível processar esta imagem."
                        )
                    );


                };


            imagem.src =
                urlImagem;


        }
    );


}



/************************************************

 GERAR BLOB DA IMAGEM

************************************************/


function gerarBlobImagem(
    canvas,
    qualidade
) {


    return new Promise(
        function(resolve, reject) {


            canvas.toBlob(
                function(blob) {


                    if (!blob) {


                        reject(
                            new Error(
                                "Não foi possível otimizar a imagem."
                            )
                        );


                        return;


                    }


                    resolve(
                        blob
                    );


                },


                "image/jpeg",


                qualidade
            );


        }
    );


}



/************************************************

 ENVIAR FOTO

************************************************/


async function enviarFoto() {


    const status =
        document.getElementById(
            "statusEnvio"
        );


    if (!fotoSelecionada) {


        status.innerText =
            "📸 Escolha ou tire uma foto primeiro.";


        return;


    }


    try {


        /*
            Primeiro otimiza a foto
            diretamente no dispositivo
            da pessoa.
        */


        status.innerText =
            "🖼️ Otimizando foto...";


        const fotoOtimizada =
            await otimizarFoto(
                fotoSelecionada
            );


        /*
            Mostra aproximadamente
            o tamanho final.
        */


        const tamanhoMB =
            (
                fotoOtimizada.size /
                1024 /
                1024
            )
            .toFixed(1);


        status.innerText =
            "☁️ Enviando foto otimizada (" +
            tamanhoMB +
            " MB)...";


        /*
            Agora todas as fotos
            otimizadas são salvas
            como JPG.
        */


        const nomeArquivo =

            "aguardando/" +

            Date.now() +

            "_" +

            Math.random()
            .toString(36)
            .substring(2,8) +

            ".jpg";


        const {

            error

        } =

        await supabaseClient
            .storage
            .from(BUCKET)
            .upload(

                nomeArquivo,

                fotoOtimizada,

                {

                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        "image/jpeg"

                }

            );


        if (error) {


            console.error(
                error
            );


            status.innerText =
                "❌ Erro ao enviar a foto: " +
                error.message;


            return;


        }


        status.innerText =
            "✅ Foto enviada com sucesso! Obrigado por compartilhar esse momento ❤️";


        fotoSelecionada =
            null;


        document
            .getElementById("fotoInput")
            .value = "";


        document
            .getElementById(
                "previewContainer"
            )
            .classList
            .add(
                "escondido"
            );


    }


    catch (erro) {


        console.error(
            erro
        );


        status.innerText =
            "❌ Erro ao otimizar a foto. Tente novamente.";


    }


}



/************************************************

 ABRIR SENHA

************************************************/


function abrirSenha() {


    const autorizado =
        localStorage.getItem(
            "adminAutorizado"
        );


    if (
        autorizado === "sim"
    ) {


        modoGaleria =
            "pendentes";


        esconderTodasTelas();


        document
            .getElementById(
                "validacaoTela"
            )
            .classList
            .remove(
                "escondido"
            );


        document.querySelector(
            "#validacaoTela h2"
        ).innerText =
            "📋 Fotos Aguardando Liberação";


        document
            .getElementById(
                "botaoSairTopo"
            )
            .classList
            .add(
                "escondido"
            );


        carregarFotosPendentes();


        return;


    }


    esconderTodasTelas();


    document
        .getElementById(
            "senhaTela"
        )
        .classList
        .remove(
            "escondido"
        );


}



/************************************************

 VALIDAR SENHA

************************************************/


function validarSenha() {


    const senha =

        document
        .getElementById("senha")
        .value;


    const erro =

        document
        .getElementById(
            "erroSenha"
        );


    if (
        senha === SENHA_ADMIN
    ) {


        localStorage.setItem(
            "adminAutorizado",
            "sim"
        );


        modoGaleria =
            "pendentes";


        esconderTodasTelas();


        document
            .getElementById(
                "validacaoTela"
            )
            .classList
            .remove(
                "escondido"
            );


        document.querySelector(
            "#validacaoTela h2"
        ).innerText =
            "📋 Fotos Aguardando Liberação";


        document
            .getElementById(
                "botaoSairTopo"
            )
            .classList
            .add(
                "escondido"
            );


        erro.innerText = "";


        carregarFotosPendentes();


    }


    else {


        erro.innerText =
            "❌ Senha incorreta!";


    }


}



/************************************************

 ATUALIZAR FOTOS

************************************************/


function atualizarFotos() {


    if (
        modoGaleria ===
        "aprovadas"
    ) {


        visualizarFotos();


    }

    else {


        carregarFotosPendentes();


    }


}



/************************************************

 CARREGAR FOTOS PENDENTES

************************************************/


async function carregarFotosPendentes() {


    modoGaleria =
        "pendentes";


    document
        .getElementById(
            "botaoSairTopo"
        )
        .classList
        .add(
            "escondido"
        );


    const galeria =

        document
        .getElementById(
            "galeriaPendentes"
        );


    const mensagem =

        document
        .getElementById(
            "nenhumaFoto"
        );


    galeria.innerHTML = "";


    mensagem.innerText =
        "⏳ Carregando fotos...";


    const {

        data,

        error

    } =

    await supabaseClient
        .storage
        .from(BUCKET)
        .list(

            "aguardando",

            {

                limit: 1000,

                sortBy: {

                    column:
                        "created_at",

                    order:
                        "desc"

                }

            }

        );


    if (error) {


        console.error(error);


        mensagem.innerText =
            "❌ Erro ao carregar as fotos.";


        return;


    }


    if (

        !data ||

        data.length === 0

    ) {


        mensagem.innerText =
            "📭 Nenhuma foto aguardando aprovação.";


        return;


    }


    mensagem.innerText =

        "📸 " +

        data.length +

        " foto(s) aguardando aprovação";


    data.forEach(
        function(foto) {


            criarCardFoto(
                foto
            );


        }
    );


}



/************************************************

 CRIAR CARD DA FOTO

************************************************/


function criarCardFoto(foto) {


    const caminho =

        "aguardando/" +
        foto.name;


    const {

        data

    } =

    supabaseClient
        .storage
        .from(BUCKET)
        .getPublicUrl(
            caminho
        );


    const urlFoto =
        data.publicUrl;


    const galeria =

        document
        .getElementById(
            "galeriaPendentes"
        );


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "foto-card";


    card.innerHTML =

        `

        <img
            src="${urlFoto}"
            alt="Foto enviada"
        >


        <div class="nome-foto">

            ${foto.name}

        </div>


        <div class="botoes-foto">


            <button
                class="botao-aprovar"
                onclick="aprovarFoto('${foto.name}')"
            >

                ✅ Permitir

            </button>


            <button
                class="botao-reprovar"
                onclick="reprovarFoto('${foto.name}')"
            >

                ❌ Bloquear

            </button>


        </div>

        `;


    galeria.appendChild(
        card
    );


}



/************************************************

 APROVAR FOTO

************************************************/


async function aprovarFoto(nomeFoto) {


    const confirmar =

        confirm(
            "Deseja permitir esta foto?"
        );


    if (!confirmar) {


        return;


    }


    const {

        error

    } =

    await supabaseClient
        .storage
        .from(BUCKET)
        .move(

            "aguardando/" +
            nomeFoto,

            "aprovadas/" +
            nomeFoto

        );


    if (error) {


        console.error(error);


        alert(

            "❌ Erro ao aprovar a foto:\n\n" +
            error.message

        );


        return;


    }


    alert(
        "✅ Foto aprovada!"
    );


    carregarFotosPendentes();


}



/************************************************

 REPROVAR FOTO

************************************************/


async function reprovarFoto(nomeFoto) {


    const confirmar =

        confirm(
            "Deseja bloquear esta foto?"
        );


    if (!confirmar) {


        return;


    }


    const {

        error

    } =

    await supabaseClient
        .storage
        .from(BUCKET)
        .move(

            "aguardando/" +
            nomeFoto,

            "reprovadas/" +
            nomeFoto

        );


    if (error) {


        console.error(error);


        alert(

            "❌ Erro ao bloquear a foto:\n\n" +
            error.message

        );


        return;


    }


    alert(
        "🚫 Foto bloqueada!"
    );


    carregarFotosPendentes();


}



/************************************************

 VISUALIZAR FOTOS APROVADAS

************************************************/


async function visualizarFotos() {


    modoGaleria =
        "aprovadas";


    esconderTodasTelas();


    document
        .getElementById(
            "validacaoTela"
        )
        .classList
        .remove(
            "escondido"
        );


    document.querySelector(
        "#validacaoTela h2"
    ).innerText =
        "🖼️ Fotos Aprovadas";


    document
        .getElementById(
            "botaoSairTopo"
        )
        .classList
        .remove(
            "escondido"
        );


    const galeria =

        document
        .getElementById(
            "galeriaPendentes"
        );


    const mensagem =

        document
        .getElementById(
            "nenhumaFoto"
        );


    galeria.innerHTML = "";


    mensagem.innerText =
        "⏳ Carregando fotos aprovadas...";


    const {

        data,

        error

    } =

    await supabaseClient
        .storage
        .from(BUCKET)
        .list(

            "aprovadas",

            {

                limit: 1000,

                sortBy: {

                    column:
                        "created_at",

                    order:
                        "desc"

                }

            }

        );


    if (error) {


        mensagem.innerText =
            "❌ Erro ao carregar fotos.";


        return;


    }


    if (

        !data ||

        data.length === 0

    ) {


        mensagem.innerText =
            "📭 Ainda não existem fotos aprovadas.";


        return;


    }


    mensagem.innerText =

        data.length +

        " foto(s) disponíveis ❤️";


    data.forEach(
        function(foto) {


            const caminho =

                "aprovadas/" +
                foto.name;


            const {

                data: urlData

            } =

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


            card.innerHTML =

                `

                <img
                    src="${urlData.publicUrl}"
                    alt="Foto"
                >

                `;


            galeria.appendChild(
                card
            );


        }
    );


}



/************************************************

 ABRIR APRESENTAÇÃO

************************************************/


async function abrirApresentacao() {


    esconderTodasTelas();


    document
        .getElementById(
            "apresentacaoTela"
        )
        .classList
        .remove(
            "escondido"
        );


    await carregarFotosApresentacao();


    intervaloApresentacao =
        setInterval(

            trocarFotosApresentacao,

            10000

        );


    intervaloAtualizacaoApresentacao =
        setInterval(

            carregarFotosApresentacao,

            30000

        );


}



/************************************************

 CARREGAR FOTOS DA APRESENTAÇÃO

************************************************/


async function carregarFotosApresentacao() {


    const painel =

        document
        .getElementById(
            "painelApresentacao"
        );


    const status =

        document
        .getElementById(
            "statusApresentacao"
        );


    const {

        data,

        error

    } =

    await supabaseClient
        .storage
        .from(BUCKET)
        .list(

            "aprovadas",

            {

                limit: 1000,

                sortBy: {

                    column:
                        "created_at",

                    order:
                        "desc"

                }

            }

        );


    if (error) {


        console.error(error);


        status.innerText =
            "❌ Erro ao carregar as fotos.";


        return;


    }


    if (

        !data ||

        data.length === 0

    ) {


        painel.innerHTML = "";


        status.innerText =
            "❤️ Aguardando as primeiras fotos aprovadas...";


        return;


    }


    fotosApresentacao =

        data.map(
            function(foto) {


                const caminho =

                    "aprovadas/" +
                    foto.name;


                const {

                    data: urlData

                } =

                supabaseClient
                    .storage
                    .from(BUCKET)
                    .getPublicUrl(
                        caminho
                    );


                return {

                    nome:
                        foto.name,

                    url:
                        urlData.publicUrl

                };


            }
        );


    status.innerText =

        "❤️ " +

        fotosApresentacao.length +

        " momentos compartilhados";


    trocarFotosApresentacao();


}



/************************************************

 TROCAR FOTOS DA APRESENTAÇÃO

************************************************/


function trocarFotosApresentacao() {


    if (

        !fotosApresentacao ||

        fotosApresentacao.length === 0

    ) {


        return;


    }


    const painel =

        document
        .getElementById(
            "painelApresentacao"
        );


    const quantidade =

        Math.min(

            fotosApresentacao.length,

            8

        );


    const fotosMisturadas =

        [...fotosApresentacao]
        .sort(

            () =>
                Math.random() - 0.5

        )
        .slice(

            0,

            quantidade

        );


    painel.classList.add(
        "painel-trocando"
    );


    setTimeout(
        function() {


            painel.innerHTML = "";


            fotosMisturadas.forEach(
                function(foto,index) {


                    const card =

                        document.createElement(
                            "div"
                        );


                    card.className =
                        "foto-apresentacao";


                    if (index === 0) {


                        card.classList.add(
                            "foto-grande"
                        );


                    }

                    else if (index === 3) {


                        card.classList.add(
                            "foto-media"
                        );


                    }


                    const imagem =

                        document.createElement(
                            "img"
                        );


                    imagem.src =
                        foto.url;


                    imagem.alt =
                        "Foto do casamento";


                    card.appendChild(
                        imagem
                    );


                    painel.appendChild(
                        card
                    );


                }
            );


            painel.classList.remove(
                "painel-trocando"
            );


        },

        500

    );


}



/************************************************

 TELA CHEIA

************************************************/


function alternarTelaCheia() {


    if (

        !document.fullscreenElement

    ) {


        document
            .getElementById(
                "apresentacaoTela"
            )
            .requestFullscreen()
            .catch(
                function(error) {


                    console.error(
                        error
                    );


                }
            );


    }

    else {


        document.exitFullscreen();


    }


}



/************************************************

 SAIR DA APRESENTAÇÃO

************************************************/


function sairApresentacao() {


    clearInterval(
        intervaloApresentacao
    );


    clearInterval(
        intervaloAtualizacaoApresentacao
    );


    intervaloApresentacao =
        null;


    intervaloAtualizacaoApresentacao =
        null;


    if (
        document.fullscreenElement
    ) {


        document.exitFullscreen();


    }


    voltarInicio();


}



/************************************************

 SAIR DA VALIDAÇÃO

************************************************/


function sairValidacao() {


    voltarInicio();


}



/************************************************

 VOLTAR AO INÍCIO

************************************************/


function voltarInicio() {


    esconderTodasTelas();


    document
        .getElementById("inicio")
        .classList
        .remove("escondido");


    document
        .getElementById("senha")
        .value = "";


    document
        .getElementById(
            "erroSenha"
        )
        .innerText = "";


}



/************************************************

 ESCONDER TODAS AS TELAS

************************************************/


function esconderTodasTelas() {


    document
        .getElementById("inicio")
        .classList
        .add("escondido");


    document
        .getElementById("envioTela")
        .classList
        .add("escondido");


    document
        .getElementById("senhaTela")
        .classList
        .add("escondido");


    document
        .getElementById("validacaoTela")
        .classList
        .add("escondido");


    document
        .getElementById("apresentacaoTela")
        .classList
        .add("escondido");


}
