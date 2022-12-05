/*********************************************************************
 * Objetivo: Arquivo resposnsável pela manipulacao de dados com o BD 
 *      (insert, update, delete e select)
 * Autor: Nicolas Dobbeck
 * Data Criacao: 06/10/2022
 * Versao: 1.0
 * 
 *********************************************************************/

const insertCurso = async function (curso) {
    try {
        //Import da classe prismaClient, que é responsável pelas interacoes com o BD
        const { PrismaClient } = require('@prisma/client');

        //Instancia da classe PrismaClient
        const prisma = new PrismaClient();

        let sql = `insert into tbl_curso(nome,
                                      carga_horaria,
                                      icone,
                                      sigla
                                      ) 
                                      values(
                                        '${curso.nome}',
                                        '${curso.carga_horaria}',
                                        '${curso.icone}',
                                        '${curso.sigla}'
                                      )`;
        // Executa o script SQL no Banco de dados 
        //($executeRawUnsafe permite encaminhar uma variavel contendo o script)
        const result = await prisma.$executeRawUnsafe(sql);

        //Verifica se o script foi executado com sucesso no BD
        if (result)
            return true;
        else
            return false;
    } catch (error) {
        return false
    }
}

const updateCurso = async function (curso) {
    try {
        //Import da classe prismaClient, que é responsável pelas interacoes com o BD
        const { PrismaClient } = require('@prisma/client');

        //Instancia da classe PrismaClient
        const prisma = new PrismaClient();


        let sql = `update tbl_curso set   nome          = '${curso.nome}',
                                          carga_horaria =  ${curso.carga_horaria},
                                          icone         = '${curso.icone}',
                                          sigla         = '${curso.sigla}'
                                    where id = '${curso.id}'
                                    `;
        // Executa o script SQL no Banco de dados 
        //($executeRawUnsafe permite encaminhar uma variavel contendo o script)
        const result = await prisma.$executeRawUnsafe(sql);

        //Verifica se o script foi executado com sucesso no BD
        if (result){
            return true;
        }else{
            return false;
        }
    } catch (error) {
        return false
    }
}

const deleteCurso = async function (id) {
    try {

        //Import da classe prismaClient, que é responsável pelas interacoes com o BD
        const { PrismaClient } = require('@prisma/client');

        //Instancia da classe PrismaClient
        const prisma = new PrismaClient();

        let sql = `delete from tbl_curso
                            where id = '${id}'
                        `;

        // Executa o script SQL no Banco de dados 
        //($executeRawUnsafe permite encaminhar uma variavel contendo o script)
        const result = await prisma.$executeRawUnsafe(sql);


        //Verifica se o script foi executado com sucesso no BD
        if (result)
            return true;
        else
            return false;

    } catch (error) {
        return false;
    }

}

const selectAllCursos = async function () {
    //Import da classe prismaClient, que é responsável pelas interacoes com o BD
    const { PrismaClient } = require('@prisma/client');

    //Instancia da classe PrismaClient
    const prisma = new PrismaClient();

    const rsCursos = await prisma.$queryRaw`select cast(id as float) as id, nome, carga_horaria, icone, sigla from tbl_curso order by id desc`;

    if (rsCursos.length > 0) {
        return rsCursos
    } else {
        return false
    }
}

const selectCursoById = async function (id) {
    //Import da classe PrismaClientena qual é responsavel pelas interscoes como banco de dados
    const { PrismaClient } = require('@prisma/client')
    //Instancia da classe do prismaClient
    const prisma = new PrismaClient();

    let sql = `select cast(id as float) as id,
                                        nome,
                                        carga_horaria,
                                        icone, 
                                        sigla
                                        from tbl_curso 
                                        where id = ${id}`
    const rsCurso = await prisma.$queryRawUnsafe(sql);



    if (rsCurso.length > 0) {
        return rsCurso;
    } else {
        return false;
    }
}

module.exports = {
    insertCurso,
    updateCurso,
    deleteCurso,
    selectAllCursos,
    selectCursoById
}