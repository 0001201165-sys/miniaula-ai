import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/*
CONFIGURAÇÃO

Configure sua chave no ambiente do servidor:

OPENAI_API_KEY=sua_chave

Nunca coloque essa chave no CodePen.

*/

const API_KEY =
process.env.OPENAI_API_KEY;

/*
IA

*/

async function askTextAI(question){

const response =
await fetch(
"https://api.openai.com/v1/responses",
{
method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":
Bearer ${API_KEY}
},

body:JSON.stringify({

model:"gpt-5",

input:`

Você é o professor virtual MiniAula AI.

O usuário perguntou:

"${question}"

Crie uma mini aula visual extremamente clara.

DIVIDA A EXPLICAÇÃO EM 4 A 6 CENAS.

Para cada cena produza:

title: título curto

text: explicação correta e simples

imagePrompt: descrição detalhada da imagem que deve representar a cena

As imagens devem ser didáticas, bonitas e diferentes
entre si.

IMPORTANTE:

Não invente fatos.

Se a pergunta envolver ciência, matemática,
história, tecnologia ou outro assunto factual,
priorize precisão.

Responda SOMENTE em JSON:

{
"title":"...",
"answer":"...",
"scenes":[
{
"title":"...",
"text":"...",
"imagePrompt":"..."
}
]
}

`
})
}
);

if(!response.ok){

throw new Error(
await response.text()
);

}

const data =
await response.json();

const output =
data.output_text;

if(!output){

throw new Error(
"A IA não retornou texto."
);

}

return JSON.parse(output);

}

/*
GERAÇÃO DE IMAGENS

*/

async function generateImage(prompt){

const response =
await fetch(
"https://api.openai.com/v1/images/generations",
{
method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":
Bearer ${API_KEY}
},

body:JSON.stringify({

model:"gpt-image-1",

prompt:`

Create a high-quality educational illustration.

Topic:
${prompt}

Style:

premium educational infographic

visually clear

cinematic lighting

polished 3D illustration

accurate visual relationships

clean composition

attractive colors

dark blue educational background

no unnecessary text

suitable for a digital learning application

The image must clearly communicate
the concept being explained.
`

})
}
);

if(!response.ok){

throw new Error(
await response.text()
);

}

const data =
await response.json();

/*
A API pode devolver uma URL temporária
ou dados base64 dependendo da configuração.
*/

if(data.data?.[0]?.url){

return data.data[0].url;

}

if(data.data?.[0]?.b64_json){

return "data:image/png;base64," +
data.data[0].b64_json;

}

throw new Error(
"A imagem não foi retornada."
);

}

/*
ENDPOINT

*/

app.post(
"/api/aula",
async(req,res)=>{

try{

const question =
String(
req.body?.question || ""
).trim();

if(!question){

return res.status(400).json({
error:"Digite uma pergunta."
});

}

if(!API_KEY){

return res.status(500).json({
error:
"OPENAI_API_KEY não configurada no servidor."
});

}

/*

GERA A EXPLICAÇÃO
*/

const lesson =
await askTextAI(question);

/*
2. GERA AS IMAGENS
*/

const scenes=[];

for(
const scene
of lesson.scenes
){

const image =
await generateImage(
scene.imagePrompt
);

scenes.push({

title:scene.title,

text:scene.text,

image:image

});

}

/*
3. DEVOLVE TUDO AO CODEPEN
*/

res.json({

title:lesson.title,

answer:lesson.answer,

scenes:scenes

});

}catch(error){

console.error(error);

res.status(500).json({

error:
"Não foi possível criar a aula.",
details:error.message

});

}

});

/*
HEALTH CHECK

*/

app.get(
"/",
(req,res)=>{

res.send(
"MiniAula AI backend funcionando."
);

}
);

app.listen(
PORT,
()=>{

console.log(
MiniAula AI rodando na porta ${PORT}
);

}
);
