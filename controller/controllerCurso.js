/*********************************************************************
 * Objetivo: Arquivo resposnsável manipulacao de recebimento, 
 * tratamento e retorno de dados entre a API e a model
 * Autor: Nicolas Dobbeck
 * Data Criacao: 06/10/2022
 * Versao: 1.0
 * 
 *********************************************************************/

const { MESSAGE_ERROR, MESSAGE_SUCCESS } = require('../modulo/config.js');

const novoCurso = async function (curso) {

    //Validacao para ver se os campos obrigatórios estão preenchidos
    if (curso.nome == '' || curso.nome == undefined || curso.carga_horaria == '' || curso.carga_horaria == undefined) {
        
        return {status: 500, message: MESSAGE_ERROR.REQUIRED_FIELDS};
    }else{
        //Importe da model de curso
        const novoCurso = require('../model/DAO/curso.js');
        //Chamando a funcao feita para adicionar um curso
        const result = await novoCurso.insertCurso(curso);
        
        if(result){
            return {status: 201, message: MESSAGE_SUCCESS.INSERT_ITEM};
        }else{
            
            return {status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB};
        }
    }
}

const atualizarCurso = async function (curso) {
    if (curso.id == '' || curso.id == undefined) {
        return {status: 400, message: MESSAGE_ERROR.REQUIRED_ID};
    }else if (curso.nome == '' || curso.nome == undefined || curso.carga_horaria == '' || curso.carga_horaria == undefined) {
        return {status: 500, message: MESSAGE_ERROR.REQUIRED_FIELDS};
    }
    else{
        const atualizarCurso = require('../model/DAO/curso.js');

        const result =  await atualizarCurso.updateCurso(curso);

        
        if(result){
            return {status: 201, message: MESSAGE_SUCCESS.INSERT_ITEM};
        }else{
            return {status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB};
        }
    }
}

const excluirCurso = async function (id) {
    //Validaçao para o ID como campo obrigatório
    if (id == ''|| id == undefined)
        return {status: 400, message: MESSAGE_ERROR.REQUIRED_ID}
    else{
        //Validaçao para verificar se ID existe no BD
        const curso = await buscarCurso(id);

        //Valida se foi encontrado um registro valido
        if (curso)
        {
            //import da model de curso
            const excluirCurso = require('../model/DAO/curso.js');
            //chama a funcao para excluit\r um curso
            const result = await excluirCurso.deleteCurso(id);
            
            if (result)
                return {status: 200, message: MESSAGE_SUCCESS.DELETE_ITEM};
            else
                return {status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB};
        }else{
            return {status: 404, message: MESSAGE_ERROR.NOT_FOUND_DB};
        }
    }
}

const buscarCurso = async function (id) {
    let dadosCursosJSON = {};

    //Validaçao para o ID como campo obrigatório
    if (id == ''|| id == undefined)
        return {status: 400, message: MESSAGE_ERROR.REQUIRED_ID}
    else{

        const { selectCursoById } = require ('../model/DAO/curso.js')
        
        const dadosCurso = await selectCursoById(id);

        if (dadosCurso)
        {
            //Criamos uma chave cursos no JSON para retornar o array de cursos
            dadosCursosJSON.curso = dadosCurso;

            return dadosCursosJSON;
        }
        else
            return false;
    }
}

const listarCursos = async function () {
    let dadosCursosJSON = {};

    const { selectAllCursos} = require ('../model/DAO/curso.js');

    const dadosCursos = await selectAllCursos();
    
    if (dadosCursos)
    {
        //Criamos uma chave cursos no JSON para retornar o array de cursos
        dadosCursosJSON.cursos = dadosCursos;

        return dadosCursosJSON;
    }
    else
        return false;
}

module.exports = {
    novoCurso,
    atualizarCurso,
    excluirCurso,
    listarCursos,
    buscarCurso
}