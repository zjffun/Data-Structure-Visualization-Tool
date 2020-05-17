const allNodes = [];

function getRegReversePolishNotation(reg) {
  let i = 0,
    stack = [],
    rpn = "";
  while (i < reg.length) {
    switch (reg[i]) {
      case "a":
      case "b":
      case "*":
        rpn += reg[i];
        break;
      case "(":
      case "|":
        stack.push(reg[i]);
        break;
      case ")":
        let temp = stack.pop();
        if (temp === "|") {
          rpn += "|";
        } else {
          rpn += "+";
        }
        break;
    }
    i++;
  }
  return rpn;
}

function regRPN2NFA(reg) {
  let i = 0,
    num = 0,
    stack = [];
  let state1 = null;
  let state2 = null;
  let statePeer1 = null;
  let statePeer2 = null;
  while (i < reg.length) {
    switch (reg[i]) {
      case "a":
        state1 = [[], [], [], num++];
        state2 = [[], [], [], num++];
        allNodes.push(state1);
        allNodes.push(state2);
        state1[0].push(state2);
        stack.push([state1, state2]);
        break;
      case "b":
        state1 = [[], [], [], num++];
        state2 = [[], [], [], num++];
        allNodes.push(state1);
        allNodes.push(state2);
        state1[1].push(state2);
        stack.push([state1, state2]);
        break;
      case "+":
        statePeer1 = stack.pop();
        statePeer2 = stack.pop();
        if (statePeer2) {
          statePeer1[1][2].push(statePeer2[0]);
          stack.push([statePeer1[0], statePeer2[1]]);
        } else {
          stack.push(statePeer1);
        }
        break;
      case "*":
        state1 = [[], [], [], num++];
        allNodes.push(state1);
        statePeer1 = stack.pop();
        statePeer1[0][2].push(state1);
        statePeer1[1][2].push(state1);
        statePeer1[1][2].push(statePeer1[0]);
        stack.push([statePeer1[0], state1]);
        break;
      case "|":
        state1 = [[], [], [], num++];
        state2 = [[], [], [], num++];
        allNodes.push(state1);
        allNodes.push(state2);
        statePeer1 = stack.pop();
        statePeer2 = stack.pop();
        state1[2].push(statePeer1[0]);
        state1[2].push(statePeer2[0]);
        statePeer1[1][2].push(state2);
        statePeer2[1][2].push(state2);
        stack.push([state1, state2]);
        break;
    }
    i++;
  }
  return stack;
}

function rmEpsilon(nfa) {
  const receiving = nfa[1];
  const remainNodes = new Set(allNodes);
  function epsilonNode(node) {
    if (node === receiving || !node[2].length || !remainNodes.has(node)) {
      remainNodes.delete(node);
      return node;
    }

    const nodes = [];
    node[2].forEach((d) => {
      const enode = epsilonNode(d);
      nodes.push(enode);
    });

    node[0] = [
      ...new Set([
        ...node[0],
        ...nodes.reduce((res, cur) => {
          return res.concat(cur[0]);
        }, []),
      ]),
    ];
    node[1] = [
      ...new Set([
        ...node[1],
        ...nodes.reduce((res, cur) => {
          return res.concat(cur[1]);
        }, []),
      ]),
    ];

    remainNodes.delete(node);
    return node;
  }

  while (remainNodes.size) {
    const val = remainNodes.values().next().value;
    epsilonNode(val);
  }

  return nfa;
}
