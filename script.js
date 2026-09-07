

/************************************************

 CONFIGURAÇÕES

************************************************/


// LINK PARA ENVIAR FOTO
// Vamos colocar aqui o link do OneDrive
// configurado para receber arquivos.

// LINK PARA ENVIAR FOTO

const LINK_ENVIAR_FOTO =
    "COLE_AQUI_O_LINK_DE_ENVIO";


// LINK DA PASTA COM AS FOTOS AGUARDANDO

const LINK_FOTOS_AGUARDANDO =
    "https://1drv.ms/f/c/f203919d62721e53/IgBJxxN6tRZCR6Ei-80o3fdbAUryfiJxQAk-5yxRJelFj0w?e=weFT7p";


// LINK DA PASTA COM AS FOTOS APROVADAS

const LINK_FOTOS_APROVADAS =
    "https://1drv.ms/f/c/f203919d62721e53/IgDBWH5vRVqcTLP_ennS0ThFAbzVWbGUZoULU9zM_F_M4iM?e=bw1XGR";


// SENHA DA ÁREA DE VALIDAÇÃO

const SENHA_ADMIN =
    "CASAMENTO2026";



/************************************************

 ENVIAR FOTO

************************************************/


function enviarFoto() {

    if (
        LINK_ENVIAR_FOTO ===
        "COLE_AQUI_O_LINK_DE_ENVIO"
    ) {

        alert(
            "O link para envio das fotos ainda não foi configurado."
        );

        return;

    }


    window.open(
        LINK_ENVIAR_FOTO,
        "_blank"
    );

}



/************************************************

 VISUALIZAR FOTOS

************************************************/


function visualizarFotos() {

    if (
        LINK_FOTOS_APROVADAS ===
        "COLE_AQUI_O_LINK_DA_PASTA_APROVADAS"
    ) {

        alert(
            "O link da pasta de fotos aprovadas ainda não foi configurado."
        );

        return;

    }


    window.open(
        LINK_FOTOS_APROVADAS,
        "_blank"
    );

}



/************************************************

 ABRIR SENHA

************************************************/


function abrirSenha() {

    document
        .getElementById("inicio")
        .classList
        .add("escondido");


    document
        .getElementById("senhaTela")
        .classList
        .remove("escondido");

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
        .getElementById("erroSenha");


    if (senha === SENHA_ADMIN) {

        document
            .getElementById("senhaTela")
            .classList
            .add("escondido");


        document
            .getElementById("validacaoTela")
            .classList
            .remove("escondido");


        erro.innerText = "";

    }

    else {

        erro.innerText =
            "Senha incorreta!";

    }

}



/************************************************

 SAIR DA VALIDACAO

************************************************/


function sairValidacao() {

    voltarInicio();

}



/************************************************

 VOLTAR AO INÍCIO

************************************************/


function voltarInicio() {

    document
        .getElementById("inicio")
        .classList
        .remove("escondido");


    document
        .getElementById("senhaTela")
        .classList
        .add("escondido");


    document
        .getElementById("validacaoTela")
        .classList
        .add("escondido");


    document
        .getElementById("senha")
        .value = "";

}

