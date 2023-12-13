"use client"

import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react';
import { ProgressCircle, Button } from "@tremor/react";
import fetchChat from './api/chat/route.js'

function analyzeText(text) {
  // Replace carriage returns and newlines with spaces for uniformity
  text = text.replace(/[\r\n]/g, ' ');

  // Sentence count
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const sentenceCount = sentences.length;

  // Word count
  const words = text.match(/\b(\w+)\b/g) || [];
  const wordCount = words.length;

  // Character count (excluding spaces)
  const characterCount = text.replace(/\s/g, '').length;

  // Average number of words per sentence
  const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  // Average length of words
  const totalWordLength = words.reduce((acc, word) => acc + word.length, 0);
  const averageWordLength = wordCount > 0 ? totalWordLength / wordCount : 0;

  return [
      sentenceCount,
      wordCount,
      characterCount,
      averageWordsPerSentence,
      averageWordLength
  ]
}

const HighlightTextArea = ({ highlightData, onSnippetClick, text, setText }) => {
  const highlightsRef = useRef(null);
  const textAreaRef = useRef(null);

  const getHighlightedText = () => {
    const splitText = text.split(new RegExp(`(${highlightData.map(data => data.snippet).join('|')})`, 'gi'));
    return splitText.map((part, index) => {
      const highlight = highlightData.find(data => new RegExp(data.snippet, 'gi').test(part));
      return highlight ? (
        <mark key={index} style={{ background: (index - 1) / 2 == onSnippetClick ? highlight.color : 'none', textDecorationColor: highlight.color + " !important", textDecoration: 'underline' }}>
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      );
    });
  };

  const handleScroll = () => {
    if (highlightsRef.current) {
      highlightsRef.current.scrollTop = textAreaRef.current.scrollTop;
    }
  };

  const handleClick = (e) => {
    const cursorPosition = textAreaRef.current.selectionStart;
    const textUpToCursor = text.substring(0, cursorPosition);
    const lastIndexOfSnippet = highlightData.reduce((lastIndex, data) => {
      const index = textUpToCursor.lastIndexOf(data.snippet);
      return index > lastIndex ? index : lastIndex;
    }, -1);

    if (lastIndexOfSnippet !== -1 && lastIndexOfSnippet + text.substring(lastIndexOfSnippet).indexOf('\n') >= cursorPosition) {
      const clickedData = highlightData.find(data => textUpToCursor.includes(data.snippet));
      if (clickedData) {
        //alert(`Clicked on highlight: ${clickedData.snippet}`);
      }
    }
  };

  return (
    <div className="container relative w-full h-full grow">
      <div
        ref={highlightsRef}
        className="highlights"
        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflow: 'hidden', position: 'absolute', zIndex: 1, padding: '10px', width: '100%', height: '100%' }}
      >
        {getHighlightedText()}
      </div>
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onClick={handleClick}
        onScroll={handleScroll}
        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', position: 'absolute', zIndex: 2, width: '100%', height: '100%', margin: 0, border: '0px', padding: '10px', fontSize: '16px', resize: 'none', color: 'black', caretColor: 'black', opacity: .5 }}
      />
    </div>
  );
};


export default function Home() {

  const [scores, setScores] = useState(['0/10', '0/10', '0/10'])
  const [text, setText] = useState('')

  /*
  useEffect(()=>{
    async function getResponse(){
    const response = await fetch(`/api/chat`, 
    {method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: {text}
    })
  });
    const data = await response.json();
    console.log(data)
    }
    getResponse()
  }, [])*/


  async function getResponse() {
    const response = await fetch(`/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: { text }
        })
      });
    const data = await response.json();
    console.log(data)

    sethighlightData(JSON.parse(data.completion).issues)
    setScores(JSON.parse(data.completion).report.score)
    console.log(JSON.parse(data.completion))
  }

  const [activeHighlight, setActiveHighlight] = useState(null);

  const handleSnippetClick = (data) => {
    setActiveHighlight(data);
  };

  const [highlightData, sethighlightData] = useState([])

  const scoreTitle = ['mechanics','flow','overall']


  return (
    <div className='outline-1'>
      <div className='flex w-screen'>
        <div className="w-full">
          <div className='w-full flex place-content-center items-center'>
            <div className="w-5/6 h-5/6 bg-slate-200/20 shadow-sm rounded-md p-2">

              <div className='w-fit m-2 font-light text-sm'>
                <div className="flex">
                  {scores.map((singleScore, index) => (
                    <div className='p-2 rounded-md bg-slate-100 mr-2'>
                    <ProgressCircle value={parseFloat(singleScore) * 10} size="md">
                      <span className="text-xs text-gray-700 font-medium">{singleScore}</span>
                    </ProgressCircle>
                    <div className="font-light text-sm text-center">{scoreTitle[index]}</div>
                    </div>
                  ))}
                </div>
                <div>Sentences: {analyzeText(text)[0]}</div>
                <div className='ml-4 text-xs'>Avg sentence length: {analyzeText(text)[3]}</div>
                <div>Words: {analyzeText(text)[1]}</div>
                {/*<div className='mr-4'>Avg word length: {Math.round(analyzeText(text))[4]}</div>*/}
                <div>Characters: {analyzeText(text)[2]}</div>
              </div>
              <Button onClick={() => getResponse()}>Search {"(will be ratelimited soon)"}</Button>
            </div>
          </div>

          <div className='relative h-screen w-full flex justify-center items-center place-items-center place-content-center'>

            <div className='relative shadow-sm h-5/6 w-5/6 rounded-md bg-slate-200/20 pb-2'>
              <HighlightTextArea highlightData={highlightData} text={text} setText={setText} onSnippetClick={activeHighlight} />
            </div>
          </div>
        </div>
        <div className='relative h-screen w-full max-w-md flex justify-center items-center place-items-center place-content-center'>
          <div className="h-5/6 w-5/6 overflow-y-scroll">
            {highlightData.map((reason, index) => (
              <div className={`transition-all rounded-md bg-slate-200/20 p-2 m-2 cursor-pointer shadow-sm ${activeHighlight === index ? 'bg-blue-300 font-bold scale-95' : 'bg-slate-200/20'}`}
                onClick={() => { setActiveHighlight(index) }}
              >
                <div className='italic'>{reason.snippet}</div>
                <div className='font-light text-sm'>{reason.reason}</div>

                <div className="flex font-light text-sm">
                  <div className='p-1 bg-blue-500 rounded-md text-white'>{reason.solution[0]}</div>
                  <div>{"-->"}</div>
                  <div className="p-1 bg-blue-500 rounded-md text-white"
                    onClick={() => {
                      const newText = text.replace(reason.solution[0], reason.solution[1]);
                      setText(newText);

                      let updateIndex = [...highlightData]
                      updateIndex.splice(index,1)
                      sethighlightData(updateIndex)
                      //TODO: INDEX DELETE
                    }}
                  >{reason.solution[1]}</div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
