let instructions = (new Array(256)).fill(0);

function movR8Imm8(emu)
{
    console.log("hello");
}

for (i = 0; i < 8; i++) {
    instructions[0xB0 + i] = movR8Imm8;
}

export default instructions;
