import { Container, Title } from "@mantine/core";
import {MultipleContainers} from "./group";

function Organization() {
    return (
      <Container size={'xl'} mt={'xl'}>
            <Title weight={100}>Organization One</Title>
            <MultipleContainers/>
            
      </Container>
    );
  }

export default Organization;
