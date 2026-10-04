/*
 * CordMap: an interactive guide to spinal cord injury levels.
 * Static page, no server, nothing stored.
 *
 * Levels are numbered 1-29: C1-C8 (1-8), T1-T12 (9-20), L1-L5 (21-25),
 * S1 (26), S2 (27), S3 (28), S4-5 (29). The chosen level is the lowest
 * level that still works normally; everything below it is affected.
 */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  // ---------------------------------------------------------------
  // Level data
  // ---------------------------------------------------------------
  var LEVELS = [];
  var i;
  for (i = 1; i <= 8; i++) LEVELS.push('C' + i);
  for (i = 1; i <= 12; i++) LEVELS.push('T' + i);
  for (i = 1; i <= 5; i++) LEVELS.push('L' + i);
  LEVELS.push('S1', 'S2', 'S3', 'S4–5');

  var REGION_NAMES = { C: 'cervical', T: 'thoracic', L: 'lumbar', S: 'sacral' };

  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function levelName(code) {
    if (code === 'S4–5') return '4th and 5th sacral segments';
    return ordinal(parseInt(code.slice(1), 10)) + ' ' + REGION_NAMES[code.charAt(0)] + ' segment';
  }

  // ISNCSCI key muscles (only C5-T1 and L2-S1 have one).
  var KEY_MUSCLE = {
    C5: 'Elbow flexors (biceps): bending the elbow',
    C6: 'Wrist extensors: lifting the wrist back',
    C7: 'Elbow extensors (triceps): straightening the elbow',
    C8: 'Finger flexors: bending the tip of the middle finger',
    T1: 'Little finger abductor: spreading the little finger',
    L2: 'Hip flexors: lifting the thigh',
    L3: 'Knee extensors (quadriceps): straightening the knee',
    L4: 'Ankle dorsiflexors: pulling the foot up',
    L5: 'Long toe extensors: lifting the big toe',
    S1: 'Ankle plantar flexors (calf): pointing the foot down'
  };

  // ISNCSCI key sensory points, in plain English.
  var KEY_SENSORY = {
    C2: 'Back of the head',
    C3: 'Hollow above the collarbone',
    C4: 'Top of the shoulder',
    C5: 'Outer side of the elbow crease',
    C6: 'Back of the thumb',
    C7: 'Back of the middle finger',
    C8: 'Back of the little finger',
    T1: 'Inner side of the elbow crease',
    T2: 'Top of the armpit',
    T3: 'Chest, 3rd rib space',
    T4: 'Nipple line',
    T5: 'Chest, 5th rib space',
    T6: 'Bottom of the breastbone',
    T7: 'Chest, 7th rib space',
    T8: 'Chest, 8th rib space',
    T9: 'Chest, 9th rib space',
    T10: 'Belly button',
    T11: 'Chest, 11th rib space',
    T12: 'Middle of the groin crease',
    L1: 'Upper thigh, just below the groin',
    L2: 'Middle of the front of the thigh',
    L3: 'Inner side of the knee',
    L4: 'Inner ankle bone',
    L5: 'Top of the foot, at the third toe',
    S1: 'Outer side of the heel',
    S2: 'Back of the knee',
    S3: 'Sitting bone',
    'S4–5': 'Around the anus'
  };

  // ---------------------------------------------------------------
  // What each level means (typical for a complete injury).
  // Each function returns [status, text]. Status: works/partly/affected.
  // ---------------------------------------------------------------
  function breathing(n) {
    if (n <= 2) return ['affected', 'The diaphragm is paralysed, so a ventilator is needed to breathe.'];
    if (n === 3) return ['affected', 'The diaphragm is usually too weak to breathe alone. Most people need a ventilator, at least at first.'];
    if (n === 4) return ['partly', 'The diaphragm partly works, so many people can breathe on their own, though some need support at first.'];
    if (n <= 8) return ['partly', 'The diaphragm works, but the chest and stomach muscles don’t, so breathing is shallow and coughing is weak.'];
    if (n <= 14) return ['partly', 'Some chest muscles work, but the stomach muscles don’t, so coughing is still weak.'];
    if (n <= 20) return ['partly', 'Most breathing muscles work. Coughing gets stronger the lower the injury.'];
    return ['works', 'All the breathing muscles work.'];
  }

  function arms(n) {
    if (n <= 4) return ['affected', 'No arm movement. Shrugging the shoulders may still work, because that muscle gets its nerve straight from the brain.'];
    if (n === 5) return ['partly', 'The shoulders and elbow bending work. No wrist or hand movement.'];
    if (n === 6) return ['partly', 'Can bend the elbows and lift the wrists. Lifting the wrist makes the fingers curl, a “tenodesis grip” that can hold light objects.'];
    if (n === 7) return ['partly', 'Can also straighten the elbows, which helps with pushing up and moving in and out of a wheelchair. Grip is still weak.'];
    if (n === 8) return ['partly', 'Can also bend the fingers to grip. Fine hand movements are still weak.'];
    return ['works', 'The arms and hands work fully.'];
  }

  function trunk(n) {
    if (n <= 9) return ['affected', 'No trunk muscles, so sitting balance needs support.'];
    if (n <= 14) return ['partly', 'Only the upper chest muscles work, so sitting balance is limited.'];
    if (n <= 20) return ['partly', 'The stomach muscles partly work, more so the lower the injury, so sitting balance is better.'];
    return ['works', 'The trunk muscles work.'];
  }

  function legs(n) {
    if (n <= 21) return ['affected', 'No leg movement.'];
    if (n === 22) return ['partly', 'Can bend the hip (lift the knee). The knees and ankles don’t move.'];
    if (n === 23) return ['partly', 'Can also straighten the knee.'];
    if (n === 24) return ['partly', 'Can also pull the foot up at the ankle.'];
    if (n === 25) return ['partly', 'Can also lift the big toe. The hips and knees are stronger.'];
    if (n === 26) return ['partly', 'Can also point the foot down to push off. Most leg muscles work.'];
    return ['works', 'The leg muscles work.'];
  }

  function bladder(n) {
    if (n <= 27) return ['affected', 'Bladder, bowel and sexual function are affected, because their nerves come from S2–S4. Most people use a planned bladder and bowel routine.'];
    if (n === 28) return ['partly', 'Some bladder, bowel and sexual function may be affected, because S4–S5 are below this level.'];
    return ['works', 'Everything down to S4–S5 works, so bladder, bowel and sexual function are kept.'];
  }

  function autonomic(n) {
    if (n <= 14) return ['affected', 'At risk of autonomic dysreflexia: a dangerous rise in blood pressure set off by things like a full bladder. Blood pressure can also drop on sitting up, and body temperature control is affected.'];
    return ['works', 'Blood pressure control is usually normal. There is no autonomic dysreflexia risk below T6.'];
  }

  function mobility(n) {
    if (n <= 4) return ['affected', 'A powered wheelchair steered by the head, chin or breath. Needs help with most daily care.'];
    if (n === 5) return ['partly', 'A powered wheelchair with a hand control. Can eat with adapted equipment once it’s set up.'];
    if (n === 6) return ['partly', 'A manual wheelchair indoors, often a powered one outdoors. Can drive an adapted car and do more self-care with equipment.'];
    if (n <= 8) return ['partly', 'A manual wheelchair on most surfaces. Independent transfers and most self-care, with equipment.'];
    if (n <= 17) return ['partly', 'Fully independent in a manual wheelchair. Standing in a frame for exercise.'];
    if (n <= 21) return ['partly', 'Independent in a wheelchair. Walking with leg braces may be possible for exercise.'];
    if (n <= 24) return ['partly', 'Walking with braces and crutches may be possible, often with a wheelchair for longer distances.'];
    if (n <= 26) return ['partly', 'Walking is often possible, with ankle supports or sticks.'];
    return ['works', 'Usually walks without aids.'];
  }

  var ROWS = [
    ['Breathing', breathing],
    ['Arms and hands', arms],
    ['Trunk', trunk],
    ['Legs', legs],
    ['Bladder, bowel and sex', bladder],
    ['Blood pressure', autonomic],
    ['Getting around', mobility]
  ];

  var STATUS_LABEL = { works: 'Works', partly: 'Partly', affected: 'Affected' };

  function summaryFor(n) {
    if (n <= 3) return 'A very high neck injury: breathing, arms, trunk and legs are all affected.';
    if (n === 4) return 'A high neck injury: breathing partly works, but the arms, trunk and legs are affected.';
    if (n <= 8) return 'A neck injury: the arms partly work, but the hands, trunk and legs are affected.';
    if (n === 9) return 'The arms and hands work. The trunk and legs are affected.';
    if (n <= 20) return 'The arms work. The trunk is partly affected and the legs are affected.';
    if (n === 21) return 'The arms and trunk work. The legs are affected.';
    if (n <= 26) return 'The arms and trunk work, and the legs partly work. The bladder and bowel are affected.';
    if (n <= 28) return 'The legs mostly work, but bladder, bowel and sexual function can be affected.';
    return 'Everything down to the lowest segment works.';
  }

  function tagFor(n) {
    if (n <= 8) return 'Tetraplegia: arms, trunk and legs';
    if (n <= 20) return 'Paraplegia: trunk and legs';
    if (n <= 26) return 'Paraplegia: legs, bladder and bowel';
    if (n <= 28) return 'Paraplegia: bladder, bowel and sex';
    return 'Lowest segment';
  }

  // ---------------------------------------------------------------
  // Explorer UI
  // ---------------------------------------------------------------
  var ladder = $('ladder');
  var range = $('lvl-range');
  var regions = Array.prototype.slice.call(document.querySelectorAll('.region'));
  var buttons = [];
  var current = 6;

  var GROUPS = { 1: 'Cervical (neck)', 9: 'Thoracic (chest)', 21: 'Lumbar (lower back)', 26: 'Sacral' };

  LEVELS.forEach(function (code, idx) {
    var n = idx + 1;
    if (GROUPS[n]) {
      var g = document.createElement('p');
      g.className = 'ladder-group';
      g.textContent = GROUPS[n];
      ladder.appendChild(g);
    }
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'vert';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', code + ', ' + levelName(code));
    b.textContent = code;
    b.dataset.n = n;
    b.addEventListener('click', function () { setLevel(n, true); });
    b.addEventListener('keydown', function (e) {
      var d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 :
              (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
      if (e.key === 'Home') { e.preventDefault(); setLevel(1, true); return; }
      if (e.key === 'End') { e.preventDefault(); setLevel(LEVELS.length, true); return; }
      if (!d) return;
      e.preventDefault();
      setLevel(Math.max(1, Math.min(LEVELS.length, n + d)), true);
    });
    ladder.appendChild(b);
    buttons.push(b);
  });

  function setLevel(n, focus) {
    current = n;
    var code = LEVELS[n - 1];

    buttons.forEach(function (b, idx) {
      var bn = idx + 1;
      var on = bn === n;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      b.classList.toggle('is-below', bn > n);
    });
    if (focus) {
      buttons[n - 1].focus({ preventScroll: true });
      if (window.matchMedia('(max-width: 640px)').matches) {
        buttons[n - 1].scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    }

    range.value = n;
    range.setAttribute('aria-valuetext', code);

    regions.forEach(function (r) {
      r.classList.toggle('is-hit', parseInt(r.getAttribute('data-level'), 10) > n);
    });
    $('area-s1').classList.toggle('is-hit', 26 > n);
    $('area-s2').classList.toggle('is-hit', 27 > n);

    $('lvl-code').textContent = code;
    $('lvl-name').textContent = levelName(code);
    $('lvl-tag').textContent = tagFor(n);
    $('lvl-summary').textContent = summaryFor(n);
    $('lvl-muscle').textContent = KEY_MUSCLE[code] || 'None at this level. It’s checked by sensation instead.';
    $('lvl-sensory').textContent = KEY_SENSORY[code] || 'None at this level.';

    var rows = $('rows');
    rows.innerHTML = '';
    ROWS.forEach(function (row) {
      var res = row[1](n);
      var li = document.createElement('li');
      li.className = 'row';
      var left = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'row-name';
      name.textContent = row[0];
      var st = document.createElement('span');
      st.className = 'status s-' + res[0];
      st.textContent = STATUS_LABEL[res[0]];
      left.appendChild(name);
      left.appendChild(st);
      var text = document.createElement('div');
      text.className = 'row-text';
      text.textContent = res[1];
      li.appendChild(left);
      li.appendChild(text);
      rows.appendChild(li);
    });
  }

  range.addEventListener('input', function () { setLevel(parseInt(range.value, 10), false); });
  setLevel(current, false);

  // ---------------------------------------------------------------
  // ASIA grade helper
  // ---------------------------------------------------------------
  var STEPS = {
    start: {
      q: 'Are sensation and movement now completely normal on examination?',
      hint: 'Grade E is only used for someone who had deficits from the injury and has fully recovered.',
      yes: 'E', no: 'sacral'
    },
    sacral: {
      q: 'Is any sensation or movement kept at S4–S5, around the anus?',
      hint: 'This means feeling light touch or a pin prick around the anus, feeling deep pressure inside it, or being able to squeeze it on purpose.',
      yes: 'motor', no: 'A'
    },
    motor: {
      q: 'Is there any voluntary movement below the injury?',
      hint: 'Either a deliberate squeeze of the anus, or movement in muscles more than three levels below the motor level.',
      yes: 'strength', no: 'B'
    },
    strength: {
      q: 'Can at least half of the key muscles below the injury move against gravity?',
      hint: 'Moving against gravity means a strength of 3 or more out of 5 on the standard muscle scale.',
      yes: 'D', no: 'C'
    }
  };

  var RESULTS = {
    A: 'Complete. Nothing works at S4–S5.',
    B: 'Sensory incomplete. Some feeling is kept, including at S4–S5, but no useful movement below the injury.',
    C: 'Motor incomplete. Some movement is kept, but most key muscles below the injury can’t move against gravity.',
    D: 'Motor incomplete. At least half the key muscles below the injury can move against gravity.',
    E: 'Normal. Sensation and movement have fully recovered.'
  };

  var helperBody = $('helper-body');
  var gradeItems = Array.prototype.slice.call(document.querySelectorAll('#grade-list li'));
  var trail = [];

  function highlightGrade(g) {
    gradeItems.forEach(function (li) {
      li.classList.toggle('is-result', li.getAttribute('data-grade') === g);
    });
  }

  function renderStep(key) {
    helperBody.innerHTML = '';

    if (RESULTS[key]) {
      highlightGrade(key);
      var letter = document.createElement('div');
      letter.className = 'result-letter';
      letter.textContent = 'AIS ' + key;
      var text = document.createElement('p');
      text.className = 'result-text';
      text.textContent = RESULTS[key];
      helperBody.appendChild(letter);
      helperBody.appendChild(text);

      if (trail.length) {
        var ol = document.createElement('ol');
        ol.className = 'trail';
        trail.forEach(function (t) {
          var li = document.createElement('li');
          li.textContent = t;
          ol.appendChild(li);
        });
        helperBody.appendChild(ol);
      }

      var again = document.createElement('div');
      again.className = 'q-buttons';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-ghost';
      btn.textContent = 'Start again';
      btn.addEventListener('click', function () { trail = []; highlightGrade(null); renderStep('start'); });
      again.appendChild(btn);
      helperBody.appendChild(again);
      btn.focus({ preventScroll: true });
      return;
    }

    var step = STEPS[key];
    var order = ['start', 'sacral', 'motor', 'strength'];
    var count = document.createElement('p');
    count.className = 'q-step';
    count.textContent = 'Question ' + (order.indexOf(key) + 1) + ' of up to 4';
    var q = document.createElement('p');
    q.className = 'q-text';
    q.textContent = step.q;
    var hint = document.createElement('p');
    hint.className = 'q-hint';
    hint.textContent = step.hint;
    var row = document.createElement('div');
    row.className = 'q-buttons';

    [['Yes', step.yes], ['No', step.no]].forEach(function (opt, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = idx === 0 ? 'btn' : 'btn btn-ghost';
      b.textContent = opt[0];
      b.addEventListener('click', function () {
        trail.push(step.q + ' ' + opt[0] + '.');
        renderStep(opt[1]);
      });
      row.appendChild(b);
    });

    helperBody.appendChild(count);
    helperBody.appendChild(q);
    helperBody.appendChild(hint);
    helperBody.appendChild(row);
  }

  renderStep('start');

  // ---------------------------------------------------------------
  // Incomplete injury patterns
  // ---------------------------------------------------------------
  var PATTERNS = [
    {
      id: 'central',
      name: 'Central cord',
      cause: 'The most common incomplete pattern. Often an older person with neck arthritis whose neck is bent sharply backwards, for example in a fall, damaging the centre of the cord.',
      effects: [
        'The arms and hands are weaker than the legs, because the arm fibres run nearest the centre.',
        'Sensation below the injury is affected to a varying degree.',
        'Bladder problems are common.'
      ],
      outlook: 'Many people recover the ability to walk. Hand function usually recovers least.',
      hit: ['greyL', 'greyR'],
      partial: ['cstL', 'cstR'],
      side: false
    },
    {
      id: 'brown',
      name: 'Brown-Séquard',
      cause: 'Damage to one half of the cord, often from a stab wound or a tumour.',
      effects: [
        'Same side as the injury: weakness, and loss of vibration and position sense.',
        'Opposite side: loss of pain and temperature, starting a level or two below the injury.',
        'This split happens because the pain pathway crosses to the other side soon after entering the cord, while the movement and position pathways cross much higher up.'
      ],
      outlook: 'Has the best outlook of the incomplete patterns. Most people walk again.',
      hit: ['dcL', 'cstL', 'sttL', 'greyL'],
      partial: [],
      side: true
    },
    {
      id: 'anterior',
      name: 'Anterior cord',
      cause: 'Damage to the front two-thirds of the cord, often because the blood supply through the anterior spinal artery is cut off.',
      effects: [
        'Movement is lost below the injury.',
        'Pain and temperature sensation are lost below the injury.',
        'Vibration, position sense and fine touch are kept, because the dorsal columns at the back are spared.'
      ],
      outlook: 'Has the poorest outlook for recovering movement of the incomplete patterns.',
      hit: ['greyL', 'greyR', 'cstL', 'cstR', 'sttL', 'sttR'],
      partial: [],
      side: false
    },
    {
      id: 'posterior',
      name: 'Posterior cord',
      cause: 'Rare. Damage to the back of the cord only.',
      effects: [
        'Loss of vibration and position sense below the injury, so balance and walking in the dark become hard.',
        'Movement, pain and temperature sensation are kept.'
      ],
      outlook: 'Strength is kept, but poor position sense can still make walking unsteady.',
      hit: ['dcL', 'dcR'],
      partial: [],
      side: false
    }
  ];

  var tabsEl = $('tabs');
  var infoEl = $('pattern-info');
  var tractIds = ['dcL', 'dcR', 'cstL', 'cstR', 'sttL', 'sttR', 'greyL', 'greyR'];
  var tabs = [];

  function showPattern(idx, focus) {
    var p = PATTERNS[idx];
    tabs.forEach(function (t, j) {
      var on = j === idx;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    if (focus) tabs[idx].focus();
    infoEl.setAttribute('aria-labelledby', 'tab-' + p.id);

    tractIds.forEach(function (id) {
      var el = $(id);
      el.classList.toggle('is-hit', p.hit.indexOf(id) !== -1);
      el.classList.toggle('is-partial', p.partial.indexOf(id) !== -1);
    });
    $('side-label').style.display = p.side ? '' : 'none';

    infoEl.innerHTML = '';
    var h = document.createElement('h3');
    h.textContent = p.name + ' syndrome';
    var cause = document.createElement('p');
    cause.className = 'pattern-cause';
    cause.textContent = p.cause;
    var ul = document.createElement('ul');
    p.effects.forEach(function (e) {
      var li = document.createElement('li');
      li.textContent = e;
      ul.appendChild(li);
    });
    var out = document.createElement('p');
    out.className = 'pattern-outlook';
    out.innerHTML = '<strong>Outlook:</strong> ';
    out.appendChild(document.createTextNode(p.outlook));
    infoEl.appendChild(h);
    infoEl.appendChild(cause);
    infoEl.appendChild(ul);
    infoEl.appendChild(out);
  }

  PATTERNS.forEach(function (p, idx) {
    var t = document.createElement('button');
    t.type = 'button';
    t.className = 'tab';
    t.id = 'tab-' + p.id;
    t.setAttribute('role', 'tab');
    t.setAttribute('aria-controls', 'pattern-info');
    t.textContent = p.name;
    t.addEventListener('click', function () { showPattern(idx, false); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      showPattern((idx + d + PATTERNS.length) % PATTERNS.length, true);
    });
    tabsEl.appendChild(t);
    tabs.push(t);
  });

  showPattern(0, false);

  // Exposed for testing in the browser console.
  window.__cordmap = { setLevel: setLevel, LEVELS: LEVELS };
})();
