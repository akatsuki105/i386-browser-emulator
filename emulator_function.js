export function get_code8(emu, index) {
    return emu.memory[emu.eip + index];
}
