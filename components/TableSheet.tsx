import styles from "@/styles/TableSheet.module.css";

type Player = {
  value: string;
  label: string;
};

export default function TableSheet({
  players,
  className,
  numberOfPlayersPlaying,
  numberOfReservePlayers,
}: {
  players: Player[];
  className: string;
  numberOfPlayersPlaying: number;
  numberOfReservePlayers: number;
}) {
  let rows = [];
  for (let i = 0; i < numberOfPlayersPlaying + numberOfReservePlayers; i++) {
    rows.push(
      <Player
        key={i}
        player={players[i]}
        reserveRows={i < numberOfPlayersPlaying}
        emptyRow={i < numberOfPlayersPlaying - 1}
        solidTop={i == numberOfPlayersPlaying}
      />
    );
  }
  return (
    <div className={styles.container}>
      <table className={styles.table + " " + className}>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

const Player = ({
  player,
  reserveRows,
  emptyRow,
  solidTop,
}: {
  player: Player;
  reserveRows: boolean;
  emptyRow: boolean;
  solidTop: boolean;
}) => {
  return (
    <>
      <PlayerRows player={player} solidTop={solidTop} />
      {reserveRows ? <RowsToReserved /> : undefined}
      {emptyRow ? <EmptyRow /> : undefined}
    </>
  );
};

const PlayerRows = ({
  player,
  solidTop,
}: {
  player: { value: string; label: string };
  solidTop?: boolean;
}) => {
  const playerClass = solidTop ? styles.specialPlayerCell : styles.playerCell;
  return (
    <>
      <tr>
        <td colSpan={4} className={playerClass}>
          {player.label}
        </td>
      </tr>
      <tr>
        <td className={styles.detailsCell}>{player.value}</td>
        <td className={styles.detailsCell} colSpan={3}></td>
      </tr>
    </>
  );
};

const RowsToReserved = () => {
  const rows = (
    <>
      <tr>
        <td className={styles.playerCell} colSpan={4}></td>
      </tr>
      <tr>
        <td className={styles.detailsCell}></td>
        <td className={styles.detailsCell}></td>
        <td className={styles.detailsCell}></td>
        <td className={styles.detailsCell}></td>
      </tr>
    </>
  );
  return (
    <>
      {rows}
      {rows}
    </>
  );
};

const EmptyRow = () => {
  return (
    <tr>
      <td className={styles.emptyCell}></td>
      <td className={styles.emptyCell}></td>
      <td className={styles.emptyCell}></td>
      <td className={styles.emptyCell}></td>
    </tr>
  );
};
