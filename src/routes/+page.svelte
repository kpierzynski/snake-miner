<script>
	import { onMount } from 'svelte';
	import { log, getLogs, clearLogs } from '$lib/logger.js';

	let blockSize = 32;
	let canvasSize = 512;

	let score = 0;

	const rows = canvasSize / blockSize;
	const columns = canvasSize / blockSize;

	const DIRECTION = {
		UP: 'up',
		DOWN: 'down',
		LEFT: 'left',
		RIGHT: 'right'
	};

	const snake = {
		head: {
			x: 4,
			y: 4
		},
		tail: [
			{ x: 3, y: 4 },
			{ x: 2, y: 4 },
			{ x: 1, y: 4 }
		],
		direction: DIRECTION.RIGHT
	};

	const food = {
		x: 1,
		y: 0
	};

	let keyLock = 0;

	function initGame() {
		randomFood();

		score = 0;
		clearLogs();
		keyLock = 0;
		snake.head.x = 4;
		snake.head.y = 4;
		snake.direction = DIRECTION.RIGHT;
		snake.tail = [
			{ x: 3, y: 4 },
			{ x: 2, y: 4 },
			{ x: 1, y: 4 }
		];
	}

	function isNextMoveValid() {
		if (
			snake.tail.find((segment) => {
				if (snake.head.x === segment.x && snake.head.y === segment.y) return true;
			})
		)
			return false;

		// !() should not be here
		switch (snake.direction) {
			case DIRECTION.UP:
				return !(snake.head.y - 1 < 0);
			case DIRECTION.DOWN:
				return !(snake.head.y + 1 >= rows);
			case DIRECTION.RIGHT:
				return !(snake.head.x + 1 >= columns);
			case DIRECTION.LEFT:
				return !(snake.head.x - 1 < 0);
		}
	}

	function isFoodonHead() {
		return snake.head.x === food.x && snake.head.y === food.y;
	}

	function drawCell({ x, y }, color = '#000') {
		ctx.strokeStyle = '#000';
		ctx.fillStyle = color;
		ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
	}

	function drawFood() {
		drawCell({ x: food.x, y: food.y }, '#f00');
	}

	function drawSnake() {
		drawCell(snake.head, '#0A1');
		snake.tail.forEach((segment) => drawCell(segment, '#082'));
	}

	function drawEndGame() {
		ctx.fillStyle = '#00000080';
		ctx.fillRect(0, 0, canvasSize, canvasSize);

		ctx.fillStyle = '#fff';
		ctx.font = '50px consolas';

		const textGameOver = `GAME OVER: ${score}`;
		let textWidth = ctx.measureText(textGameOver).width;
		ctx.fillText(textGameOver, (canvasSize - textWidth) / 2, canvasSize / 2);

		const textRestart = `Press R to restart`;
		textWidth = ctx.measureText(textRestart).width;
		ctx.fillText(textRestart, (canvasSize - textWidth) / 2, canvasSize / 2 + 60);
	}

	function drawGrid() {
		let gridPatternGuard = true;
		for (let i = 0; i < rows; i++) {
			gridPatternGuard = !gridPatternGuard;
			for (let j = 0; j < columns; j++) {
				gridPatternGuard = !gridPatternGuard;
				drawCell({ x: j, y: i }, gridPatternGuard ? '#A9D751' : '#A2D049');
			}
		}
	}

	function handleKeyDown(event) {
		if (keyLock) return;

		switch (event.code) {
			case 'ArrowUp':
				if (snake.direction === DIRECTION.DOWN) return;
				snake.direction = DIRECTION.UP;
				break;
			case 'ArrowDown':
				if (snake.direction === DIRECTION.UP) return;
				snake.direction = DIRECTION.DOWN;
				break;
			case 'ArrowRight':
				if (snake.direction === DIRECTION.LEFT) return;
				snake.direction = DIRECTION.RIGHT;
				break;
			case 'ArrowLeft':
				if (snake.direction === DIRECTION.RIGHT) return;
				snake.direction = DIRECTION.LEFT;
				break;

			case 'KeyR':
				initGame();
				setup();
				break;
		}

		keyLock = 1;
	}

	function randomFood() {
		while (1) {
			const x = Math.floor(Math.random() * columns);
			const y = Math.floor(Math.random() * rows);

			if (snake.head.x === x && snake.head.y === y) continue;
			if (snake.tail.some((segment) => segment.x === x && segment.y === y)) continue;

			food.x = x;
			food.y = y;
			return;
		}
	}

	function setup() {
		canvas.focus();

		async function update() {
			if (!isNextMoveValid()) {
				clearInterval(ticker);
				console.log('GAME OVER');
				drawEndGame();

				const response = await fetch('/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(getLogs())
				});

				return;
			}

			ctx.clearRect(0, 0, canvasSize, canvasSize);
			drawGrid();

			snake.tail.unshift({ x: snake.head.x, y: snake.head.y });

			switch (snake.direction) {
				case DIRECTION.UP:
					snake.head.y--;
					break;
				case DIRECTION.DOWN:
					snake.head.y++;
					break;
				case DIRECTION.RIGHT:
					snake.head.x++;
					break;
				case DIRECTION.LEFT:
					snake.head.x--;
					break;
			}

			if (isFoodonHead()) {
				score++;
				randomFood();
			} else {
				snake.tail.pop();
			}

			drawFood();
			drawSnake();

			log(snake, food, score);
			keyLock = 0;
		}

		const ticker = setInterval(update, 1000 / 5);
	}

	function welcome() {
		ctx.fillStyle = '#00000080';
		ctx.fillRect(0, 0, canvasSize, canvasSize);

		ctx.fillStyle = '#fff';
		ctx.font = '40px consolas';

		const textWelcome = `Press R to start`;
		let textWidth = ctx.measureText(textWelcome).width;
		ctx.fillText(textWelcome, (canvasSize - textWidth) / 2, canvasSize / 2);

		const textControls = `Controls: Arrow Keys`;
		textWidth = ctx.measureText(textControls).width;
		ctx.fillText(textControls, (canvasSize - textWidth) / 2, canvasSize / 2 + 50);
	}

	let canvas;
	let lock = 1;
	$: ctx = canvas?.getContext('2d');
	$: if (ctx && lock) {
		lock = 0;
		welcome();
	}
</script>

<div>
	<h1>SCORE: {score}</h1>
</div>

<canvas
	bind:this={canvas}
	id="snakeCanvas"
	width={canvasSize}
	height={canvasSize}
	on:keydown={handleKeyDown}
	tabindex="0"
></canvas>

<style>
	h1 {
		font-family: consolas;
		text-align: center;
		background-color: rgba(9, 102, 9, 0.75);
		color: white;
		margin: 0;
		padding: 1rem;
	}
	canvas {
		border: 1px solid #000;
		display: block;
		margin: 20px auto;
	}

	:global(body) {
		background: url($lib/assets/bg.jpg);
		background-position: center;
		padding: 0;
		margin: 0;
	}
</style>
