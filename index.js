function solve() {
  const allElements = document.querySelectorAll('*');
  
  const normalize = (raw) => {
    const questions = Array.isArray(raw.questions) ? raw.questions : [];
    const currentQuestionId = raw.currentQuestionId 
        ?? (raw.currentQuestion && raw.currentQuestion.id) 
        ?? undefined;
    const currentQuestion = questions.find(q => q.id === currentQuestionId) 
        || raw.currentQuestion 
        || null;
    const nextQuestion = questions.find(q => q.id === raw.nextQuestionId) 
        || raw.nextQuestion 
        || null;
    return {
      raw,
      questions,
      currentQuestion,
      nextQuestion,
      currentQuestionId,
      nextQuestionId: raw.nextQuestionId
    };
  };
  
  let gameState = null;
  
  // Search DOM for React game state
  for (const el of allElements) {
    const keys = Object.keys(el);
    const reactKey = keys.find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
    if (!reactKey) continue;
    
    let fiber = el[reactKey];
    let depth = 0;
    
    while (fiber && depth < 60) {
      const candidates = [
        fiber.memoizedState,
        fiber.memoizedProps,
        fiber.stateNode && (fiber.stateNode.state || fiber.stateNode),
        fiber.return && fiber.return.memoizedState,
        fiber.return && fiber.return.memoizedProps
      ];
      
      for (const cand of candidates) {
        if (!cand) continue;
        if (Array.isArray(cand.questions)) {
          gameState = normalize(cand);
          break;
        }
        if (cand.gameState && Array.isArray(cand.gameState.questions)) {
          gameState = normalize(cand.gameState);
          break;
        }
        for (const k of Object.keys(cand)) {
          try {
            const v = cand[k];
            if (v && Array.isArray(v.questions)) {
              gameState = normalize(v);
              break;
            }
            if (v && v.gameState && Array.isArray(v.gameState.questions)) {
              gameState = normalize(v.gameState);
              break;
            }
          } catch (e) {}
        }
      }
      if (gameState) break;
      fiber = fiber.return;
      depth++;
    }
    if (gameState) break;
  }
  
  if (!gameState) {
    console.log('Game state not found');
    return null;
  }
  
  console.log('Game state found:', gameState);
  
  // Click the current question's element
  if (gameState.currentQuestion) {
    const questionId = gameState.currentQuestion.id;
    let targetEl = null;
    

    targetEl = document.querySelector(`[id^="AREA_"][id*="${questionId.split('-').pop().toUpperCase()}"]`);
    
    targetEl = document.querySelector(`[id^="RIVER_"][id*="${questionId.split('-').pop().toUpperCase()}"]`);

     targetEl = document.querySelector(`[id^="CITY_"][id*="${questionId.split('-').pop().toUpperCase()}"]`);

    if (!targetEl) {
      const parts = questionId.split('-');
      if (parts.length >= 3) {
        const isoNumber = parts[2]; // e.g., "51177" from "ISO-US-51177"
        targetEl = document.getElementById(`FIPS_${isoNumber}`);
      }
    }
    
    // If still not found, try direct ID match
    if (!targetEl) {
      targetEl = document.getElementById(questionId);
    }
    
    if (targetEl) {
      // Simulate mousedown, mouseup, and click
      ['mousedown', 'mouseup', 'click'].forEach(evtType => {
        const evt = new MouseEvent(evtType, {
          bubbles: true,
          cancelable: true,
          view: window
        });
        targetEl.dispatchEvent(evt);
      });
      console.log(`Clicked element with ID: ${targetEl.id}`);
    } else {
      console.log(`Element not found for question ID: ${questionId}`);
    }
  }
  
  return gameState;
}

async function main() {
  while (true) {
    solve();
    await new Promise(resolve => setTimeout(resolve, 1));
  }
}

main();
