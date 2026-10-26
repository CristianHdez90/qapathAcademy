import type {ReactNode} from 'react';

type Step={title:string;content:ReactNode};
const hints:Record<string,Step[]>={
 baseline:[
  {title:'Compara con una aserción',content:<><code>assert(condición, mensaje)</code> comprueba una condición. Si es falsa, la prueba falla.</>},
  {title:'Usa igualdad estricta',content:<><code>===</code> compara el valor y el tipo de dato.<pre><code>{"assert(total(1) === 35000, 'Cotización básica');"}</code></pre>Para una unidad, el resultado esperado es <strong>35.000 COP</strong>.</>},
  {title:'Comprueba la diferencia',content:<>Cambia la expectativa a <code>35001</code> y vuelve a ejecutar. La aserción debe fallar. <code>console.log</code> muestra datos, pero por sí solo no valida el resultado.</>},
 ],
 boundaries:[
  {title:'Separa válidos e inválidos',content:<>La cantidad debe ser un entero entre <code>1</code> y <code>5</code>. Explora las fronteras y contrástalas con <code>−1</code>, <code>0</code>, <code>6</code> y <code>1.5</code>.</>},
  {title:'Busca el rechazo esperado',content:<>Cada cantidad inválida debe lanzar <code>RangeError</code>. El bloque <code>try/catch</code> permite capturar ese error y comprobarlo.</>},
  {title:'Revisa qué demuestra la prueba',content:<>Si no se lanza el error esperado, la aserción debe fallar. Un rechazo esperado también puede ser una prueba correcta. Revisa además el cupón permitido y el mínimo de compra para QA10.</>},
 ],
 mutation:[
  {title:'Localiza la operación incorrecta',content:<>La versión con defecto descuenta también el envío:<pre><code>{'(subtotal + delivery) * 0.9'}</code></pre></>},
  {title:'Contrasta esperado y obtenido',content:<>Con tres unidades, QA10 y entrega, se esperan <strong>104.500 COP</strong>. El defecto produce <strong>103.500 COP</strong>: cobra 1.000 COP menos.</>},
  {title:'Corrige y vuelve a comprobar',content:<>Aplica el descuento solo al subtotal y después suma el envío. Ejecuta las mismas aserciones para comprobar la corrección.</>},
 ],
 retest:[
  {title:'Revisa la regla corregida',content:<>Primero resta el descuento al subtotal; después suma el envío.<pre><code>{'return subtotal - discount + delivery;'}</code></pre></>},
  {title:'Conserva las mismas entradas',content:<>Repite la prueba con <code>total(3, 'QA10', 'delivery')</code>. Mantener las entradas y la expectativa permite comparar con el fallo anterior.</>},
  {title:'Comprueba el resultado',content:<>El total debe ser <strong>104.500 COP</strong> y la aserción debe pasar. Revisa la salida real antes de registrar tu conclusión.</>},
 ],
 free:[
  {title:'Define qué esperas',content:<>Elige una entrada y calcula su resultado esperado según la regla que quieres comprobar.</>},
  {title:'Escribe una comprobación',content:<><code>assert(condición, mensaje)</code> falla si la condición es falsa. Por ejemplo:<pre><code>{"assert(total(1) === 35000, 'Una unidad sin envío');"}</code></pre></>},
  {title:'Ejecuta y contrasta',content:<>Revisa las aserciones y su salida real. Imprimir mensajes sin aserciones permite explorar, pero no verifica una prueba.</>},
 ],
 git:[
  {title:'Crea y guarda tu archivo',content:<>Inicializa con <code>git init -b main</code> para elegir la rama inicial. Escribe un caso o una conclusión en <code>caso.md</code> y guarda el archivo.</>},
  {title:'Prepara la versión',content:<>Consulta <code>status</code> para revisar los cambios y usa <code>add</code> para preparar el archivo. Si lo editas después, guarda y prepara de nuevo.</>},
  {title:'Confirma y revisa',content:<>Crea un <code>commit</code> y consulta <code>log</code>. Las marcas reflejan el estado real del repositorio. El kit incluye los archivos JavaScript para versionarlos también en tu equipo.</>},
 ],
 'reflection-0':[
  {title:'Identifica la entrada',content:<>Indica el valor que probaste: por ejemplo, <code>quantity = 1</code> o una cantidad inválida como <code>0</code>.</>},
  {title:'Explica la regla y la expectativa',content:<>Una unidad produce <strong>35.000 COP</strong>. Una cantidad de cero debe lanzar <code>RangeError</code>.</>},
  {title:'Relaciona la aserción con la salida',content:<>Explica cómo tu aserción compara lo esperado con lo obtenido. Describe la prueba que realmente ejecutaste.</>},
 ],
 'reflection-1':[
  {title:'Explica el fallo',content:<>El defecto aplica el descuento al envío:<pre><code>{'(105000 + 10000) * 0.9 = 103500'}</code></pre></>},
  {title:'Contrasta la corrección',content:<>La regla correcta descuenta solo el subtotal:<pre><code>{'105000 - 10500 + 10000 = 104500'}</code></pre></>},
  {title:'Usa tu evidencia',content:<>Compara las salidas del fallo y del retest. Si solo leíste el ejemplo, indícalo; no lo presentes como una ejecución propia.</>},
 ],
 'reflection-2':[
  {title:'Distingue guardar y preparar',content:<>Guardar modifica el archivo. <code>git add</code> prepara esa versión; una edición posterior requiere guardar y preparar de nuevo.</>},
  {title:'Explica qué conserva el commit',content:<><code>git commit</code> registra una versión del archivo. Describe qué caso o conclusión incluiste en tu entrega.</>},
  {title:'Identifica la versión',content:<>El SHA identifica el commit local. Consulta la bitácora para relacionarlo con el archivo confirmado; crear un commit no publica el trabajo.</>},
 ],
};

export function ProgrammingHint({topic}:{topic:string}){
 return <div className="programming-hint-steps">{(hints[topic]||hints.free).map((step,index)=><div key={step.title}><strong>{index+1}. {step.title}</strong><div className="programming-hint-content">{step.content}</div></div>)}</div>;
}
