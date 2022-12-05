/*********************************************************************
 * Objetivo: Arquivo resposnsável manipulacao de recebimento, 
 * tratamento e retorno de dados entre a API e a model
 * Autor: Nicolas Dobbeck
 * Data Criacao: 06/10/2022
 * Versao: 1.0
 * 
 *********************************************************************/

//arquivo de mensagens padronizadas
const {MESSAGE_ERROR, MESSAGE_SUCCESS} = require('../modulo/config.js');

//Funcao para gerar um novo aluno
const novoAluno = async function (aluno) {

    //Validacao de campos obrigatórios
    if (aluno.nome == '' || aluno.nome == undefined || aluno.foto == '' || aluno.foto == undefined || aluno.rg == '' || aluno.rg == undefined || aluno.cpf == '' || aluno.cpf == undefined || aluno.email == '' || aluno.email == undefined || aluno.data_nascimento == '' || aluno.data_nascimento == undefined)
        return {status: 400, message: MESSAGE_ERROR.REQUIRED_FIELDS};
    //Validacao para verificar email válido    
    else if (!aluno.email.includes('@'))
        return {status: 400, message: MESSAGE_ERROR.INVALID_EMAIL};
    else
    {
        //import da model de aluno
        const novoAluno = require('../model/DAO/aluno.js');
        //Import da model alunocurso (Tabela de relacao das duas entidades)
        const novoAlunoCurso = require('../model/DAO/aluno_curso.js');
        
        //Chama a funcao para inserir novo aluno
        const resultNovoAluno = await novoAluno.insertAluno(aluno);

        //Verifica se os dados do novo aluno foi inserido no BD
        if (resultNovoAluno){

            //Chama a funcao que verifica qual po id gerado para o novo aluno
            const idNovoAluno = await novoAluno.selectLastId();

            if(idNovoAluno > 0){
                //Cria um objeto JSON
                let alunoCurso = {};

                //Retorna o  ano corrente
                let anoMatricula = new Date().getFullYear();
            
                //Cria a matricula do aluno (id_aluno + id_curso + ano corrente)
                let numero_matricula = `${idNovoAluno}${aluno.curso[0].id_curso}${anoMatricula}`

                //Cria o objeto Json com todos as chaves e valores
                alunoCurso.id_aluno = idNovoAluno;
                alunoCurso.id_curso = aluno.curso[0].id_curso;
                alunoCurso.matricula = numero_matricula;
                alunoCurso.status_aluno = 'Cursando';

                //Chama a funcao para inserir na tabela alunoCurso
                const resultNovoAlunoCurso = await novoAlunoCurso.insertAlunoCurso(alunoCurso);
                

                if (resultNovoAlunoCurso) {
                    return {status: 201, message: MESSAGE_SUCCESS.INSERT_ITEM};
                } else {
                    //Caso aconteca um erro no processo de insercao do aluno, obrigatoriamente 
                    //o mesmo devera ser excluido
                    await excluirAluno(idNovoAluno)
                    return {status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB};
                }
            } else {
                    //Caso aconteca um erro no processo de insercao do aluno, obrigatoriamente 
                    //o mesmo devera ser excluido
                    await excluirAluno(idNovoAluno)
                    return {status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB};
            }
        } 
        else {
            return {status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB};
        }
    }
}

//Funcao para atualizar um registro
const atualizarAluno = async function (aluno) {

    
    //Validaçao para o ID como campo obrigatório
    if (aluno.id == ''|| aluno.id == undefined)
        return {status: 400, message: MESSAGE_ERROR.REQUIRED_ID}
    //Validacao de campos obrigatórios
    else if (aluno.nome == '' || aluno.nome == undefined || aluno.foto == '' || aluno.foto == undefined || aluno.rg == '' || aluno.rg == undefined || aluno.cpf == '' || aluno.cpf == undefined || aluno.email == '' || aluno.email == undefined || aluno.data_nascimento == '' || aluno.data_nascimento == undefined)
        return {status: 400, message: MESSAGE_ERROR.REQUIRED_FIELDS};
    //Validacao para verificar email válido    
    else if (!aluno.email.includes('@'))
        return {status: 400, message: MESSAGE_ERROR.INVALID_EMAIL};
    else
    {
        //import da model de aluno
        const atualizarAluno = require('../model/DAO/aluno.js');

        //chama a funcao para atualizar um aluno
        const result = await atualizarAluno.updateAluno(aluno);
        
        if (result)
            return {status: 200, message: MESSAGE_SUCCESS.UPDATE_ITEM};
        else
            return {status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB};
    }


}

//Funcao para excluir um registro
const excluirAluno = async function (id) {
    //Validaçao para o ID como campo obrigatório
    if (id == ''|| id == undefined)
        return {status: 400, message: MESSAGE_ERROR.REQUIRED_ID}
    else{
        //Validaçao para verificar se ID existe no BD
        const aluno = await buscarAluno(id);

        //Valida se foi encontrado um registro valido
        if (aluno)
        {
            //import da model de aluno
            const excluirAluno = require('../model/DAO/aluno.js');
            //chama a funcao para atualizar um aluno
            const result = await excluirAluno.deleteAluno(id);
            
            if (result)
                return {status: 200, message: MESSAGE_SUCCESS.DELETE_ITEM};
            else
                return {status: 500, message: MESSAGE_ERROR.INTERNAL_ERROR_DB};
        }else{
            return {status: 404, message: MESSAGE_ERROR.NOT_FOUND_DB};
        }
    }
}

//Funcao para retornar todos os registros
const listarAlunos = async function () {
    let dadosAlunosJSON = {};
    //let alunosCursoArray = []

    const { selectAllAlunos } = require ('../model/DAO/aluno.js');
    const { selectAlunoCurso } = require ('../model/DAO/aluno_curso.js')

    //Busca todos os alunos
    const dadosAlunos = await selectAllAlunos();

    if (dadosAlunos)
    {
        const alunosCursoArray = dadosAlunos.map( async itemAluno => {
            //Busca os dados referentes ao curso do aluno
            const dadosAlunoCurso = await selectAlunoCurso(itemAluno.id);
            
            if (dadosAlunoCurso) {
                //Acrescenta uma chave curso e coloca os dados do curso do aluno
                itemAluno.curso = dadosAlunoCurso
            }else 
                itemAluno.curso = MESSAGE_ERROR.NO_COURSE;
            
            return itemAluno
        });
        
        dadosAlunosJSON.alunos = (await Promise.all(alunosCursoArray));
        
        //Criamos uma chave alunos no JSON para retornar o array dos alunos
        dadosAlunosJSON.alunos = dadosAlunos; 

        return dadosAlunosJSON;
    }
    else
        return false;
}

//Funcao para retornar um registro baseado no ID
const buscarAluno = async function (id) {
    let dadosAlunosJSON = {};

    //Validaçao para o ID como campo obrigatório
    if (id == ''|| id == undefined)
        return {status: 400, message: MESSAGE_ERROR.REQUIRED_ID}
    else{

        //Import das models aluno e alunoCurso
        const { selectByIdAluno } = require ('../model/DAO/aluno.js');
        const { selectAlunoCurso } = require('../model/DAO/aluno_curso.js')

        const dadosAluno = await selectByIdAluno(id);

        if (dadosAluno)
        {   
            //Busca os daddos referente ao curso do aluno
            const dadosAlunoCurso = await selectAlunoCurso(id);

            if (dadosAlunoCurso) {
                
                //Adiciona a chave curso dentro do objeto dos dados do aluno e
                //acrescentar os dados do curso do aluno
                dadosAluno[0].curso = dadosAlunoCurso;
                //Criamos uma chave alunos no JSON para retornar o array de alunos
                dadosAlunosJSON.aluno = dadosAluno;

                return dadosAlunosJSON;
            } else {
                dadosAlunosJSON.aluno = dadosAluno;

                return dadosAlunosJSON;
            }
        }
        else
            return false;
    }
}

module.exports = {
    listarAlunos,
    novoAluno,
    atualizarAluno,
    excluirAluno,
    buscarAluno
}
