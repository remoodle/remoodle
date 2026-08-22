import { C1_ALL_1, C1_ALL_2, C1_ALL_3 } from "../shared/ui/others";
import {
  C1_1_1,
  C1_2_1,
  C1_3_1,
  C1_1_2,
  C1_2_2,
  C1_3_2,
  C1_1_3,
  C1_2_3,
  C1_3_3,
} from "../shared/ui/separate";

const Show = ({ selectedFloorBlockOption }) => {
  switch (selectedFloorBlockOption) {
    case "firstC1.1":
      return <C1_1_1 />;
    case "secondC1.1":
      return <C1_1_2 />;
    case "thirdC1.1":
      return <C1_1_3 />;

    case "firstC1.2":
      return <C1_2_1 />;
    case "secondC1.2":
      return <C1_2_2 />;
    case "thirdC1.2":
      return <C1_2_3 />;

    case "firstC1.3":
      return <C1_3_1 />;
    case "secondC1.3":
      return <C1_3_2 />;
    case "thirdC1.3":
      return <C1_3_3 />;

    case "first":
      return <C1_ALL_1 />;
    case "second":
      return <C1_ALL_2 />;
    case "third":
      return <C1_ALL_3 />;
    default:
      return <C1_ALL_1 />;
  }
};

export default Show;
