"use client"

import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react';
import { ProgressCircle, Button } from "@tremor/react";
import fetchChat from '../api/chat/route.js'
import { Select, SelectItem } from "@tremor/react";
import { AnimatePresence, motion } from 'framer-motion'
import { SparklesIcon, FireIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/solid'


import ReactDOM from 'react-dom';
import { Editor, EditorState, Modifier, CompositeDecorator, SelectionState } from 'draft-js';
import 'draft-js/dist/Draft.css';


//if you get gpt4 use fire?

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
    const characterCount = text./*replace(/\s/g, '').*/length;

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


const findWithRegex = (regex, contentBlock, callback) => {
    const text = contentBlock.getText();
    let matchArr, start;
    while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
    }
};

// Utility function for escaping RegExp special characters
function escapeRegExp(string) {
    if (typeof string !== 'string') {
        console.warn('escapeRegExp was called without a string:', string);
        return ''; // Return an empty string to avoid further errors
    }
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to create a decorator based on highlight data
const createHighlightDecorator = (highlightData) => {
    if (!Array.isArray(highlightData)) {
        console.warn('createHighlightDecorator called without an array:', highlightData);
        return new CompositeDecorator([]); // Return an empty decorator to avoid errors
    }

    return new CompositeDecorator(
        highlightData.map(({ snippet, color }) => ({
            strategy: (contentBlock, callback, contentState) => {
                console.log(snippet)
                findWithRegex(new RegExp(escapeRegExp(snippet), 'g'), contentBlock, callback);
            },
            component: ({ children }) => (
                <span style={{ textUnderlineOffset: 2, textDecorationColor: color }}>{children}</span>
            ),
        }))
    );
};





const HighlightTextArea = ({ highlightData, onSnippetClick }) => {
    const [text, setText] = useState("");
    const highlightsRef = useRef(null);
    const textAreaRef = useRef(null);

    useEffect(() => {
        const syncScroll = () => {
            if (highlightsRef.current && textAreaRef.current) {
                highlightsRef.current.scrollTop = textAreaRef.current.scrollTop;
                highlightsRef.current.scrollLeft = textAreaRef.current.scrollLeft;
            }
        };

        const textArea = textAreaRef.current;
        textArea.addEventListener('scroll', syncScroll);

        // Cleanup
        return () => textArea.removeEventListener('scroll', syncScroll);
    }, []);

    const getHighlightedText = (textContent) => {
        const regexPattern = new RegExp(`(${highlightData.map(data => escapeRegExp(data.snippet)).join('|')})`, 'gi');
        const splitText = textContent.split(regexPattern);

        return splitText.map((part, index) => {
            const highlight = highlightData.find(data => new RegExp(escapeRegExp(data.snippet), 'gi').test(part));
            if (highlight) {
                return (
                    <mark style={{ background: highlight.color, textDecoration: 'underline', textDecorationColor: highlight.color }}>
                        {part}
                    </mark>
                );
            }
            return <span>{part}</span>;
        });
    };

    return (
        <div className="container relative w-full h-full">

            <div
                ref={highlightsRef}
                className="highlights"
                style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    overflow: 'hidden',
                    position: 'absolute',
                    zIndex: 1,
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '10px',
                    pointerEvents: 'none',
                }}
            >
                {getHighlightedText(text)}
            </div>
            <textarea
                ref={textAreaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="text-area"
                placeholder="Write anything..."
                style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    position: 'absolute',
                    zIndex: 2,
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                    margin: 0,
                    border: 'none',
                    padding: '10px',
                    fontSize: '16px',
                    resize: 'none',
                    background: 'transparent',
                    color: 'black',
                    caretColor: 'black',
                }}
            />
        </div>
    );
};







export default function Home() {
    const [scores, setScores] = useState({
        analysis: "write something to get an analysis.",
        score: ['0/10', '0/10', '0/10']
    })
    const [text, setText] = useState('')
    //engine 2 = gemini
    const [engine, setEngine] = useState(2)
    const [searching, setSearching] = useState(false)

    async function getResponse() {
        setSearching(true)
        const response = await fetch(`/api/chat`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt: { text },
                    engine: ['claude', 'gemini'][engine - 1]
                })
            });
        const data = await response.json();
        sethighlightData(JSON.parse(data.completion).issues)
        setScores(JSON.parse(data.completion).report)
        setSearching(false)

    }

    const [activeHighlight, setActiveHighlight] = useState(null);

    const handleSnippetClick = (data) => {
        setActiveHighlight(data);
    };

    const [highlightData, sethighlightData] = useState([])

    const scoreTitle = ['mechanics', 'flow', 'overall']
    const [editorState, setEditorState] = useState('');

    useEffect(() => {
        if (highlightData.length > 0) {
            // Create a decorator with the new highlight data
            const newDecorator = createHighlightDecorator(highlightData);

            // Preserve the current content and selection
            const contentState = editorState.getCurrentContent();
            const selectionState = editorState.getSelection();

            // Create a new EditorState with the updated decorator and preserve the content
            const newEditorState = EditorState.createWithContent(contentState, newDecorator);

            // Force the new editor state to use the existing selection state
            const editorStateWithSelection = EditorState.forceSelection(newEditorState, selectionState);

            // Update the editor state
            console.log(editorStateWithSelection)
            setEditorState(editorStateWithSelection);
        } else {
            if (!editorState) {
                setEditorState(EditorState.createEmpty());
            }
        }
    }, [highlightData]);

    const handleEditorChange = (newEditorState) => {
        setEditorState(newEditorState);

        // Correctly extracting and setting plain text
        const extractedText = newEditorState.getCurrentContent().getPlainText();
        setText(extractedText); // Now, this should work without error
    };

    const handleSolutionClick = (snippet, solution) => {
        const contentState = editorState.getCurrentContent();
        const blocks = contentState.getBlockMap();

        let targetRange;

        blocks.some((block) => {
            const blockText = block.getText();
            const start = blockText.indexOf(snippet);
            if (start !== -1) {
                const blockKey = block.getKey();
                const end = start + snippet.length;
                targetRange = new SelectionState({
                    anchorKey: blockKey,
                    anchorOffset: start,
                    focusKey: blockKey,
                    focusOffset: end,
                });
                return true; // Stop iteration once the first snippet is found
            }
            return false;
        });

        if (!targetRange) {
            console.log("Snippet not found");
            return;
        }

        // Replace the snippet with the solution
        const contentStateWithSolution = Modifier.replaceText(
            contentState,
            targetRange,
            solution,
        );

        // Update the editor state with the new content
        const newEditorState = EditorState.push(
            editorState,
            contentStateWithSolution,
            'insert-characters'
        );

        // Optionally set the selection state to the end of the newly inserted text
        const newSelectionState = targetRange.merge({
            anchorOffset: targetRange.getFocusOffset(),
            focusOffset: targetRange.getFocusOffset(),
        });

        const finalEditorState = EditorState.forceSelection(newEditorState, newSelectionState);

        setEditorState(finalEditorState);
    };



    return (
        <div className='outline-1'>
            <div className='flex w-screen'>

                <div className="w-full p-4 pr-2 h-screen">

                    <div className='relative h-full w-full flex justify-center items-center place-items-center place-content-center'>

                        <div className='relative shadow-sm rounded-md bg-slate-200/70 h-full w-full overflow-y-scroll p-4'>
                            {editorState && (
                                <Editor editorState={editorState} onChange={handleEditorChange} />
                            )}
                        </div>
                    </div>
                </div>
                <div className='relative h-full w-full max-w-md justify-center place-items-center place-content-center p-4 pl-2'>
                    <div className=''>
                        <div className="bg-slate-200/20 shadow-sm rounded-md p-2">

                            <div className='w-fit m-2 font-light text-sm'>
                                <div className={`p-2 ${scores.analysis == 'write something to get an analysis.' ? '' : 'w-fit mx-auto'}`}>{scores.analysis}</div>
                                {scores.analysis != 'write something to get an analysis.' &&
                                    <div>
                                        <div className="flex">
                                            {scores.score.map((singleScore, index) => (
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
                                        <div>Characters: {analyzeText(text)[2]}</div></div>
                                }
                            </div>
                            <div className='flex justify-between'>
                                <Button onClick={() => { if (searching == false) { getResponse() } }} className={`flex disabled:bg-blue-300 disabled:outline-none`} disabled={searching == true || text.length == 0}>
                                    <motion.div className="w-fit">
                                        {searching == true &&
                                            <svg className="animate-spin h-5 w-5 text-white flex" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>}
                                        {searching == false && "Search"}
                                    </motion.div>
                                </Button>
                                {/*<div className="max-w-sm space-y-6">
                  <Select value={engine} onValueChange={setEngine}>
                    <SelectItem value="1" icon={ClipboardDocumentListIcon}>
                      Claude
                    </SelectItem>
                    <SelectItem value="2" icon={SparklesIcon}>
                    Gemini (new!)
                    </SelectItem>
                  </Select>
                  </div>*/}
                            </div>
                        </div>
                    </div>
                    <div className="h-full w-full overflow-y-scroll">
                        <AnimatePresence initial={false}>

                            {highlightData.map((reason, index) => (
                                <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, x: 300 }} className={`transition-all rounded-md bg-slate-200/20 p-2 m-2 cursor-pointer shadow-sm ${activeHighlight === index ? 'bg-blue-300 font-bold scale-95' : 'bg-slate-200/20'}`}
                                    onClick={() => { setActiveHighlight(index) }}
                                >
                                    <motion.div className='italic'>{reason.snippet}</motion.div>
                                    <motion.div className='font-light text-sm'>{reason.reason}</motion.div>

                                    <motion.div className="flex flex-wrap font-light text-sm w-full">
                                        {reason.solution != undefined &&
                                            <motion.div>
                                                <motion.div className="p-1 bg-blue-500 rounded-md text-white"
                                                    onClick={() => {
                                                        handleSolutionClick(reason.snippet, reason.solution)
                                                    }}
                                                >{reason.solution}</motion.div>
                                            </motion.div>
                                        }
                                    </motion.div>

                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
