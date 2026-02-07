use itertools::Itertools;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Mutex};
use wasm_bindgen::prelude::*;
use web_sys::console;

static GLOBAL_KNOWLEDGE: Lazy<Mutex<Knowledge>> =
  Lazy::new(|| Mutex::new(Knowledge::new()));

#[derive(Clone, Debug)]
pub struct Knowledge {
  data: Option<Data>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Data {
  #[serde(default = "filter_default")]
  active_filter: usize,
  active_card: Option<String>,
  id: usize,
  name: String,
  cards: Vec<Card>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[wasm_bindgen]
pub struct Card {
  card: CardCard,
  categories: Vec<String>,
  id: usize,
  #[serde(default = "filter_default")]
  filter: usize,
  quantity: usize,
}

fn filter_default() -> usize {
  2
}

#[allow(non_snake_case)]
#[derive(Clone, Debug, Deserialize, Serialize)]
#[wasm_bindgen]
pub struct CardCard {
  id: usize,
  uid: String,
  oracleCard: OracleCard,
  scryfallImageHash: String,
  rarity: String,
  globalCategories: Vec<String>,
}

#[allow(non_snake_case)]
#[derive(Clone, Debug, Deserialize, Serialize)]
#[wasm_bindgen]
pub struct OracleCard {
  id: usize,
  cmc: usize,
  colorIdentity: Vec<String>,
  colors: Vec<String>,
  layout: String,
  uid: String,
  legalities: HashMap<String, Option<String>>,
  manaCost: String,
  manaProduction: HashMap<String, Option<usize>>,
  name: String,
  power: String,
  subTypes: Vec<String>,
  superTypes: Vec<String>,
  keywords: Vec<String>,
  text: String,
  toughness: String,
  types: Vec<String>,
  defaultCategory: Option<String>,
  gameChanger: bool,
  extraTurns: bool,
  tutor: bool,
  massLandDenial: bool,
  twoCardComboSingelton: bool,
  twoCardComboIds: Vec<String>,
  atomicCombos: Vec<String>,
  potentialCombos: Vec<String>,
}

impl Default for Knowledge {
  fn default() -> Self {
    Self::new()
  }
}

impl Knowledge {
  pub fn new() -> Self {
    Knowledge { data: None }
  }

  pub fn card_quantity(
    &self,
    uid: &str,
  ) -> usize {
    4
  }

  pub fn categories(&self) -> Vec<String> {
    self
      .data
      .as_ref()
      .unwrap()
      .cards
      .iter()
      .map(|card| card.categories[0].clone())
      .unique()
      .sorted()
      .collect::<Vec<String>>()
  }

  pub fn load_json(
    &mut self,
    content: String,
  ) {
    self.data = Some(serde_json::from_str(&content).unwrap())
  }

  pub fn set_active_filter(
    &mut self,
    filter: usize,
  ) {
    self.data.as_mut().unwrap().active_filter = filter
  }

  //
}

#[wasm_bindgen]
pub struct Deck;

#[wasm_bindgen]
impl Deck {
  pub fn active_filter() -> Result<usize, JsValue> {
    let known = GLOBAL_KNOWLEDGE
      .lock()
      .map_err(|_| JsValue::from_str("could not get data lock"))?;
    Ok(known.data.as_ref().unwrap().active_filter)
  }

  pub fn card_quantity(uid: String) -> Result<usize, JsValue> {
    Ok(
      GLOBAL_KNOWLEDGE
        .lock()
        .map_err(|_| JsValue::from_str("could not get data lock"))?
        .card_quantity(&uid),
    )
  }

  pub fn card_in_out_maybe(uid: String) -> Result<String, JsValue> {
    let known = GLOBAL_KNOWLEDGE
      .lock()
      .map_err(|_| JsValue::from_str("could not get data lock"))?;
    Ok(
      if let Some(card) = known
        .data
        .as_ref()
        .unwrap()
        .cards
        .iter()
        .find(|card| card.card.uid == uid)
      {
        if card.filter == 2 {
          "in".to_string()
        } else if card.filter == 1 {
          "maybe".to_string()
        } else {
          "out".to_string()
        }
      } else {
        "out".to_string()
      },
    )
  }

  pub fn cards_in_category(
    category: String
  ) -> Result<Vec<String>, JsValue> {
    let known = GLOBAL_KNOWLEDGE
      .lock()
      .map_err(|_| JsValue::from_str("could not get data lock"))?;
    Ok(
      known
        .data
        .as_ref()
        .unwrap()
        .cards
        .iter()
        .filter(|card| card.categories[0] == category)
        .filter(|card| {
          card.filter == known.data.as_ref().unwrap().active_filter
        })
        .map(|card| card.card.uid.clone())
        .collect(),
    )
  }

  pub fn categories() -> Result<Vec<String>, JsValue> {
    Ok(
      GLOBAL_KNOWLEDGE
        .lock()
        .map_err(|_| JsValue::from_str("could not get data lock"))?
        .categories(),
    )
  }

  pub fn load_json(content: String) -> Result<(), JsValue> {
    console::log_1(&"Loading JSON data".into());
    GLOBAL_KNOWLEDGE
      .lock()
      .map_err(|_| JsValue::from_str("could not get data lock"))?
      .load_json(content);
    Ok(())
  }

  pub fn set_active_filter(filter: usize) -> Result<(), JsValue> {
    console::log_1(
      &format!("Setting active filter to {}", filter).into(),
    );
    GLOBAL_KNOWLEDGE
      .lock()
      .map_err(|_| JsValue::from_str("could not get data lock"))?
      .set_active_filter(filter);
    Ok(())
  }

  // pub fn change_item() -> Result<(), JsValue> {
  //   GLOBAL_KNOWLEDGE
  //     .lock()
  //     .map_err(|_| JsValue::from_str("could not get data lock"))?
  //     .change_item();
  //   Ok(())
  // }

  // pub fn current_index() -> Result<usize, JsValue> {
  //   Ok(
  //     GLOBAL_KNOWLEDGE
  //       .lock()
  //       .map_err(|_| JsValue::from_str("could not get data lock"))?
  //       .current_index(),
  //   )
  // }

  // pub fn current_item() -> Result<String, JsValue> {
  //   Ok(
  //     GLOBAL_KNOWLEDGE
  //       .lock()
  //       .map_err(|_| JsValue::from_str("could not get data lock"))?
  //       .current_item(),
  //   )
  // }

  // pub fn dump_json() -> Result<String, JsValue> {
  //   Ok(
  //     GLOBAL_KNOWLEDGE
  //       .lock()
  //       .map_err(|_| JsValue::from_str("could not get data lock"))?
  //       .dump_json(),
  //   )
  // }

  //
}

// pub fn change_item(&mut self) {
//   self.data.as_mut().unwrap().current_index += 1;
//   if self.data.as_ref().unwrap().current_index
//     >= self.data.as_ref().unwrap().items.len()
//   {
//     self.data.as_mut().unwrap().current_index = 0
//   }
// }

// pub fn current_index(&self) -> usize {
//   self.data.as_ref().unwrap().current_index
// }

// pub fn current_item(&self) -> String {
//   self.data.as_ref().unwrap().items[self.current_index()].clone()
// }

// pub fn dump_json(&self) -> String {
//   serde_json::to_string_pretty(self.data.as_ref().unwrap())
//     .unwrap()
// }
