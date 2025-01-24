const LEVELS_DATA = [
	{
		"number": 1,
		"entities": [
			["Block", 180, 360, 600, 30],
			["Block", 180, 180, 30, 180],
			["Block", 750, 180, 30, 180],
			["Spawn", 210, 330],
			["Finish", 720, 330, 30, 30],
			["Block", 420, 330, 120, 30],
			["Text", "Use the arrow keys to move. Your goal in each level is to reach the finish portal.\n\nEach time you reach the portal, you climb a little closer to infinity! However, nobody knows what waits at the end, for nobody has been there.", 480, 180]
		],
		"blockCol": [128, 64, 0],
		"textCol": [255]
	},
	{
		"number": 2,
		"entities": [
			["Block", 180, 540, 240, 30],
			["Spawn", 180, 510],
			["Block", 390, 570, 180, 30],
			["Lava", 420, 550, 120, 20],
			["Block", 540, 510, 30, 60],
			["Block", 570, 480, 120, 30],
			["Block", 690, 420, 30, 30],
			["Block", 750, 390, 30, 30],
			["Block", 660, 330, 60, 30],
			["Finish", 660, 300, 30, 30],
			["Text", "Lava is dangerous. Also, don't fall into the void!", 480, 210]
		],
		"blockCol": [0, 128, 0],
		"textCol": [255]
	},
	{
		"number": 3,
		"entities": [
			["Block", 180, 540, 240, 30],
			["Block", 180, 480, 30, 60],
			["Spawn", 210, 510],
			["Trampoline", 360, 530, 60, 10],

			["Block", 390, 430, 300, 30],
			["Trampoline", 570, 420, 120, 10],
			["Lava", 570, 300, 30, 30],
			["Lava", 660, 300, 30, 30],
			["Finish", 660, 230, 30, 30],
			["Text", "Trampolines are bouncy.", 480, 210]
		],
		"blockCol": [128],
		"textCol": [0, 128, 0]
	},
	{
		"number": 4,
		"entities": [
			["Block", 180, 300, 30, 60],
			["Block", 180, 360, 240, 30],
			["Spawn", 210, 330],
			["Numeral", 300, 330, "2"],
			["Operator", 330, 330, "+"],
			["Numeral", 360, 330, "7"],
			["Machine", 390, 330],
			["Block", 690, 360, 90, 30],
			["Finish", 750, 330, 30, 30],
			["Text", "Numbers, operators, and a funny machine...\n\nPerhaps they can help you get across this gap?", 480, 150]
		],
		"blockCol": [0, 192, 255],
		"textCol": [255],
		"intended_solution": [
			"7+2=[9]"
		]
	},
	{
		"number": 5,
		"entities": [
			["Block", 180, 510, 150, 30],
			["Spawn", 180, 480],
			["Numeral", 240, 450, "4"],
			["Numeral", 270, 450, "1"],
			["Numeral", 300, 450, "2"],
			["Operator", 240, 480, "+"],
			["Trampoline", 370, 570, 10, 30],
			["Lava", 390, 540, 30, 90],
			["Lava", 390, 420, 30, 30],
			["Trampoline", 430, 600, 10, 30],
			["Operator", 420, 540, "^"],

			["Block", 420, 420, 30, 30],
			["Block", 450, 450, 30, 30],
			["Block", 480, 480, 60, 30],
			["Numeral", 480, 450, "7"],
			["Block", 510, 450, 60, 30],
			["Block", 540, 420, 30, 30],
			["Block", 570, 360, 210, 30],
			["Operator", 660, 330, "-"],
			["Trampoline", 750, 350, 30, 10],

			["Block", 720, 240, 30, 30],
			["Block", 150, 240, 30, 30],
			["Finish", 240, 120, 30, 30],
			["Text", "Remember to be creative and use your resources.", 480, 90]
		],
		"blockCol": [255],
		"textCol": [255],
		"intended_solution": [
			"4+1=5",
			"5^2-7=[18]"
		]
	},
	{
		"number": 6,
		"entities": [
			["Block", 180, 420, 30, 60],
			["Block", 180, 480, 120, 30],
			["Spawn", 210, 450],
			["Numeral", 330, 420, "8"],
			["Block", 390, 480, 150, 30],
			["Numeral", 450, 450, "2"],
			["Operator", 270, 450, "/"],
			["Lava", 540, 510, 90, 30],
			["Block", 630, 480, 150, 30],
			["Trampoline", 750, 470, 30, 10],

			["Block", 390, 240, 30, 60],
			["Cannon", 360, 270],
			["Block", 420, 270, 330, 30],
			["Block", 540, 360, 30, 30],
			["Cannon", 600, 300],
			["Cannon", 630, 300],
			["Cannon", 660, 300],
			["Cannon", 690, 300],
			["Cannon", 600, 330],
			["Cannon", 630, 330],
			["Cannon", 660, 330],
			["Cannon", 690, 330],
			["Block", 690, 360, 60, 30],
			["Block", 720, 300, 30, 60],
			["Finish", 420, 240, 30, 30],
			
			["Text", "This is the cannon, the last object type you'll see.", 480, 150]
		],
		"blockCol": [255, 128, 0],
		"textCol": [255],
		"intended_solution": [
			"8/2=[4] (use to block the space under the group of 8 cannons)"
		]
	},
	{
		"number": 7,
		"entities": [
			["Block", 180, 630, 150, 30],
			["Spawn", 180, 600],
			["Numeral", 240, 600, "9"],
			["Numeral", 300, 600, "1"],
			["Cannon", 240, 480],
			["Lava", 330, 630, 90, 30],
			["Operator", 360, 570, "√"],
			["Block", 420, 630, 30, 30],
			["Trampoline", 420, 620, 30, 10],
			["Block", 480, 630, 30, 30],
			["Trampoline", 480, 620, 30, 10],
			["Operator", 450, 570, "("],
			["Cannon", 510, 510],
			["Operator", 450, 480, ")"],

			["Block", 510, 480, 240, 30],
			["Numeral", 510, 450, "5"],
			["Operator", 540, 450, "-"],
			["Trampoline", 720, 470, 30, 10],
			["Operator", 720, 390, "+"],
			["Block", 510, 390, 210, 30],
			["Block", 300, 390, 30, 30],
			["Numeral", 300, 360, "4"],
			["Block", 180, 450, 120, 30],
			["Trampoline", 180, 440, 30, 10],

			["Block", 220, 330, 20, 30],
			["Trampoline", 240, 330, 510, 30],
			["Trampoline", 210, 320, 60, 10],
			["Trampoline", 210, 330, 10, 30],
			["Cannon", 720, 300],
			["Cannon", 720, 270],
			["Cannon", 690, 300],
			["Cannon", 690, 270],
			["Cannon", 660, 300],
			["Cannon", 660, 270],
			["Cannon", 630, 300],
			["Cannon", 630, 270],
			["Block", 220, 210, 20, 60],
			["Trampoline", 210, 210, 10, 60],
			["Trampoline", 240, 240, 510, 30],
			["Trampoline", 210, 270, 60, 10],
			["Trampoline", 750, 240, 30, 120],
			
			["Block", 240, 180, 30, 30],
			["Block", 240, 210, 30, 30],
			["Lava", 270, 210, 510, 30],
			["Block", 660, 180, 120, 30],
			["Finish", 750, 150, 30, 30]
		],
		"blockCol": [128, 64, 128],
		"textCol": [255],
		"intended_solution": [
			"√(4)=[2]",
			"9+5-1=[13]"
		]
	},
	{
		"number": 8,
		"entities": [
			["Block", 180, 360, 300, 30],
			["Spawn", 180, 330],
			["Numeral", 210, 330, "i"],
			["Operator", 240, 330, "("],
			["Numeral", 270, 330, "9"],
			["Operator", 300, 330, "*"],
			["Operator", 330, 330, ")"],
			["Numeral", 360, 330, "e"],
			["Operator", 390, 330, "+"],
			["Numeral", 420, 330, "π"],
			["Operator", 450, 330, "^"],
			["Block", 720, 360, 60, 30],
			["Finish", 750, 330, 30, 30]
		],
		"blockCol": [64],
		"textCol": [255],
		"intended_solution": [
			"e^(i*π)+9=[8]"
		]
	}
];
