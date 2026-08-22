import { useContext } from "react";
import { SearchIcon } from "@chakra-ui/icons";
import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import { MapContext } from "../shared";

const Search = () => {
  const {
    isKeyboardTyping,
    selectedBlockOption,
    handleBlockOptionChange,
    search,
    handleSearchInput,
    width,
  } = useContext(MapContext);
  const colorBgSelect = useColorModeValue("#242a36cf", "#edf2f7d3");
  const colorSelect = useColorModeValue("#edf2f7", "#242a36");
  const colorInput = useColorModeValue("#edf2f7", "#242a36");
  const colorBgInput = useColorModeValue("#242a36", "#edf2f7");
  const colorInputPlaceholder = useColorModeValue("#edf2f7", "#242a366a");

  return (
    <Flex
      mt={"20px"}
      pos={"absolute"}
      zIndex={20}
      width={width}
      justifyContent={"center"}
    >
      <Select
        pointerEvents={!isKeyboardTyping ? "auto" : "none"}
        bg={!isKeyboardTyping ? colorBgSelect : "gray"}
        color={colorSelect}
        value={selectedBlockOption}
        onChange={handleBlockOptionChange}
        borderEndRadius={0}
        borderStartRadius={9}
        width={"auto"}
      >
        <option style={{ color: colorBgSelect }} value="">
          all
        </option>
        <option style={{ color: colorBgSelect }} value="C1.1">
          C1.1
        </option>
        <option style={{ color: colorBgSelect }} value="C1.2">
          C1.2
        </option>
        <option style={{ color: colorBgSelect }} value="C1.3">
          C1.3
        </option>
      </Select>
      <InputGroup w={"180px"}>
        <Input
          borderEndRadius={9}
          borderStartRadius={0}
          bg={colorBgInput}
          color={colorInput}
          type={"text"}
          width={"auto"}
          placeholder={"126 or C1.2.223"}
          _placeholder={{ color: colorInputPlaceholder }}
          value={search}
          onChange={(e) => {
            handleSearchInput(e);
          }}
        />
        <InputRightElement children={<SearchIcon color={colorInput} />} />
      </InputGroup>
    </Flex>
  );
};

export default Search;
