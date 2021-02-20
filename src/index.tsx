import 'bulmaswatch/superhero/bulmaswatch.min.css';
import * as esbuild from 'esbuild-wasm';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';
import CodeEditor from './components/code-editor';

const App = () =>{
  const ref = useRef<any>();
  const iframe = useRef<any>();
  const [input, setInput] = useState('');

  const onClick = async () => {
    if(!ref.current) {
      return;
    }

    iframe.current.srcdoc = html;

    const result = await ref.current.build(
      {
        entryPoints: ['index.js'],
        bundle: true,
        write: false,
        plugins: [
          unpkgPathPlugin(),
          fetchPlugin(input)
        ],
        define: {
          'process.env.NODE_ENV': '"production"',
          global: 'window'
        }
      });
    // setCode(result.outputFiles[0].text);
      // try{
      //   eval(result.outputFiles[0].text);
      // } catch (err) {
      //   alert(err);
      // }

      iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*')
    
  }

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
    });
  }

  useEffect(() =>{
    startService();
  },[])

  const html = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (event) =>{
            try{
              eval(event.data);
            } catch (err) {
              const root = document.querySelector('#root');
              root.innerHTML = '<div style="color: red;">' + err + '</div>'
            }
          }, false)
        </script>
      </body>
    </html>
`;

  return (
  <div>
    <CodeEditor 
    initialValue={input} 
    onChange={(value)=>{setInput(value ? value: '')}}/>
    <div>
      <button onClick={onClick}>Submit</button>
    </div>
    <iframe ref={iframe} title='code-preview' sandbox='allow-scripts' srcDoc={html}></iframe>
  </div>);
}



ReactDOM.render(
  <App />,
  document.getElementById('root')
);
