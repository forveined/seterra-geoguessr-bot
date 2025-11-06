// ctrl shift i or f12 then run this in console

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

  for (const el of allElements) {
    const keys = Object.keys(el);
    const reactKey = keys.find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')); // okay bro
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
    console.log('click the play button then run the script');
    return null;
  }

  console.log('Game state found:', gameState);
  if (gameState.currentQuestion) {
    const isoNumber = gameState.currentQuestion.id.split('-')[2]; // best security ong bro
    const pathEl = document.getElementById(`FIPS_${isoNumber}`); // nice security G
    if (pathEl) {
      ['mousedown', 'mouseup', 'click'].forEach(evtType => { // didnt know if click or mouseup/down worked so i just did both
        const evt = new MouseEvent(evtType, {
          bubbles: true,
          cancelable: true,
          view: window
        });
        pathEl.dispatchEvent(evt);
      });
      console.log(`Clicked path FIPS_${isoNumber}`);
    } else {
      console.log(`FIPS path FIPS_${isoNumber} not found`);
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
