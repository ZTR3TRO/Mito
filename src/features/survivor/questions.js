import { prepareQuestionOptions, shuffle } from '../../core/utils.js';
import { activeCourse } from '../course/course.js';

let deck = [];
let source = null;

function questions(){
  return activeCourse().questions || [];
}

function refill(){
  const qs = questions();
  source = qs;
  deck = shuffle(qs);
}

export function resetQuestionDeck(){
  deck = [];
  source = null;
}

export function hasQuestionBank(){
  return questions().length > 0;
}

export function nextSurvivorQuestion(){
  const qs = questions();
  if(qs.length === 0) return null;
  if(source !== qs || deck.length === 0) refill();
  return prepareQuestionOptions(deck.pop());
}
